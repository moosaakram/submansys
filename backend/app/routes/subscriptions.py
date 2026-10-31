"""
Subscription and Quotation Lifecycle Endpoints.
State Machine: Draft -> Quotation -> Confirmed -> Active -> Closed/Paused/Renewed.
"""

import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_staff_or_admin
from app.schemas.subscriptions import (
    SubscriptionActionResponse,
    SubscriptionCreate,
    SubscriptionResponse,
)
from database.models import (
    Customer,
    Plan,
    Product,
    ProductVariant,
    Subscription,
    SubscriptionLine,
    SubscriptionStatus,
    User,
    UserRole,
)

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions & Quotes"])


@router.get(
    "/",
    response_model=List[SubscriptionResponse],
    summary="List Subscriptions",
    description="Returns subscriptions. Customers see only their own; staff/admin see all.",
)
def list_subscriptions(
    status_filter: Optional[SubscriptionStatus] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Subscription)

    # Scoping: If customer, restrict to their customer record
    if current_user.role == UserRole.CUSTOMER:
        if not current_user.customer_id:
            return []
        query = query.filter(Subscription.customer_id == current_user.customer_id)

    if status_filter:
        query = query.filter(Subscription.status == status_filter)

    return query.order_by(Subscription.created_at.desc()).all()


@router.post(
    "/",
    response_model=SubscriptionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Subscription / Quote",
    description="Creates a new subscription or quotation with calculated product lines",
)
def create_subscription(
    req: SubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Customer validation
    customer = db.query(Customer).filter(Customer.id == req.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")

    # Scoping check for customers
    if current_user.role == UserRole.CUSTOMER and current_user.customer_id != req.customer_id:
        raise HTTPException(status_code=403, detail="Customers can only create quotes for themselves.")

    # Plan resolution and defaults
    plan = None
    auto_close = False
    allow_early_close = True
    allow_pause = True
    allow_renew = True

    if req.plan_id:
        plan = db.query(Plan).filter(Plan.id == req.plan_id).first()
        if plan:
            auto_close = plan.auto_close
            allow_early_close = plan.allow_early_close
            allow_pause = plan.allow_pause
            allow_renew = plan.allow_renew

    now = datetime.now(timezone.utc)
    start_dt = req.start_date or now
    expiry_dt = req.expiry_date

    # Auto-generate unique subscription reference number
    count = db.query(Subscription).count() + 1
    sub_number = f"SUB-{now.year}-{count:04d}"

    subscription = Subscription(
        subscription_number=sub_number,
        customer_id=req.customer_id,
        plan_id=req.plan_id,
        billing_cycle=req.billing_cycle or (plan.billing_cycle if plan else "monthly"),
        start_date=start_dt,
        expiry_date=expiry_dt,
        payment_terms=req.payment_terms or "Net 30",
        payment_method=req.payment_method or "credit_card",
        status=SubscriptionStatus.DRAFT,
        auto_close=auto_close,
        allow_early_close=allow_early_close,
        allow_pause=allow_pause,
        allow_renew=allow_renew,
        notes=req.notes,
        total_amount=Decimal("0.00"),
        quantity=0,
    )
    db.add(subscription)
    db.commit()
    db.refresh(subscription)

    # Calculate Lines
    total_amount = Decimal("0.00")
    total_qty = 0

    for line_in in req.lines:
        product = db.query(Product).filter(Product.id == line_in.product_id).first()
        if not product:
            continue

        unit_price = line_in.unit_price if line_in.unit_price is not None else product.sales_price

        # Check for variant extra price
        if line_in.variant_id:
            variant = db.query(ProductVariant).filter(ProductVariant.id == line_in.variant_id).first()
            if variant:
                unit_price += variant.price_extra

        tax_rate = line_in.tax_rate if line_in.tax_rate is not None else Decimal("0.000")
        line_subtotal = unit_price * line_in.quantity
        line_tax = (line_subtotal * tax_rate) / Decimal("100.00")
        line_total = line_subtotal + line_tax

        sub_line = SubscriptionLine(
            subscription_id=subscription.id,
            product_id=product.id,
            variant_id=line_in.variant_id,
            product_name=product.name,
            quantity=line_in.quantity,
            unit_price=unit_price,
            tax_rate=tax_rate,
            amount=line_total,
        )
        db.add(sub_line)
        total_amount += line_total
        total_qty += line_in.quantity

    subscription.total_amount = total_amount
    subscription.quantity = max(1, total_qty)
    db.commit()
    db.refresh(subscription)

    return subscription


@router.get(
    "/{sub_id}",
    response_model=SubscriptionResponse,
    summary="Get Subscription",
)
def get_subscription(
    sub_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found.")

    if current_user.role == UserRole.CUSTOMER and sub.customer_id != current_user.customer_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    return sub


@router.post(
    "/{sub_id}/confirm",
    response_model=SubscriptionActionResponse,
    summary="Confirm Quote / Subscription",
    description="Transitions a Draft or Quotation into Confirmed status",
)
def confirm_subscription(
    sub_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(require_staff_or_admin),
):
    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found.")

    sub.status = SubscriptionStatus.CONFIRMED
    db.commit()
    db.refresh(sub)
    return SubscriptionActionResponse(
        message=f"Subscription {sub.subscription_number} is now Confirmed.",
        subscription=sub,
    )


@router.post(
    "/{sub_id}/activate",
    response_model=SubscriptionActionResponse,
    summary="Activate Subscription",
    description="Activates confirmed subscription and schedules next billing date",
)
def activate_subscription(
    sub_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(require_staff_or_admin),
):
    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found.")

    now = datetime.now(timezone.utc)
    sub.status = SubscriptionStatus.ACTIVE
    if not sub.next_billing_date:
        # Schedule next billing cycle interval
        if sub.billing_cycle == "daily":
            sub.next_billing_date = now + timedelta(days=1)
        elif sub.billing_cycle == "weekly":
            sub.next_billing_date = now + timedelta(weeks=1)
        elif sub.billing_cycle == "yearly":
            sub.next_billing_date = now + timedelta(days=365)
        else:
            sub.next_billing_date = now + timedelta(days=30)

    db.commit()
    db.refresh(sub)
    return SubscriptionActionResponse(
        message=f"Subscription {sub.subscription_number} is now Active.",
        subscription=sub,
    )


@router.post(
    "/{sub_id}/pause",
    response_model=SubscriptionActionResponse,
    summary="Pause Subscription",
    description="Pauses active subscription if permitted by plan policy",
)
def pause_subscription(
    sub_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found.")

    if not sub.allow_pause:
        raise HTTPException(
            status_code=400,
            detail="This subscription plan does not permit pausing.",
        )

    if sub.status != SubscriptionStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Only active subscriptions can be paused.")

    sub.status = SubscriptionStatus.PAUSED
    db.commit()
    db.refresh(sub)
    return SubscriptionActionResponse(
        message=f"Subscription {sub.subscription_number} has been paused.",
        subscription=sub,
    )


@router.post(
    "/{sub_id}/resume",
    response_model=SubscriptionActionResponse,
    summary="Resume Paused Subscription",
)
def resume_subscription(
    sub_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found.")

    if sub.status != SubscriptionStatus.PAUSED:
        raise HTTPException(status_code=400, detail="Subscription is not paused.")

    sub.status = SubscriptionStatus.ACTIVE
    db.commit()
    db.refresh(sub)
    return SubscriptionActionResponse(
        message=f"Subscription {sub.subscription_number} has been resumed.",
        subscription=sub,
    )


@router.post(
    "/{sub_id}/renew",
    response_model=SubscriptionActionResponse,
    summary="Renew Subscription",
    description="Renews subscription for another term if permitted by plan policy",
)
def renew_subscription(
    sub_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found.")

    if not sub.allow_renew:
        raise HTTPException(
            status_code=400,
            detail="This plan does not permit renewal.",
        )

    now = datetime.now(timezone.utc)
    base_expiry = sub.expiry_date if sub.expiry_date and sub.expiry_date > now else now

    if sub.billing_cycle == "yearly":
        sub.expiry_date = base_expiry + timedelta(days=365)
    elif sub.billing_cycle == "weekly":
        sub.expiry_date = base_expiry + timedelta(weeks=1)
    elif sub.billing_cycle == "daily":
        sub.expiry_date = base_expiry + timedelta(days=1)
    else:
        sub.expiry_date = base_expiry + timedelta(days=30)

    sub.status = SubscriptionStatus.ACTIVE
    db.commit()
    db.refresh(sub)
    return SubscriptionActionResponse(
        message=f"Subscription {sub.subscription_number} renewed until {sub.expiry_date.strftime('%Y-%m-%d')}.",
        subscription=sub,
    )


@router.post(
    "/{sub_id}/close",
    response_model=SubscriptionActionResponse,
    summary="Close / Terminate Subscription",
    description="Terminates subscription early if permitted, or closes completed subscription",
)
def close_subscription(
    sub_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sub = db.query(Subscription).filter(Subscription.id == sub_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found.")

    now = datetime.now(timezone.utc)
    is_expired = sub.expiry_date and now >= sub.expiry_date

    # If closing early and not expired, verify allow_early_close
    if not is_expired and not sub.allow_early_close and current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=400,
            detail="This subscription plan does not allow early termination.",
        )

    sub.status = SubscriptionStatus.CLOSED
    db.commit()
    db.refresh(sub)
    return SubscriptionActionResponse(
        message=f"Subscription {sub.subscription_number} is now Closed.",
        subscription=sub,
    )
