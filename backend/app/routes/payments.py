"""
Payment Recording and Collection Endpoints.
Records payments against invoices and reconciles paid amounts and statuses.
"""

from datetime import datetime, timezone
from decimal import Decimal
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_staff_or_admin
from app.schemas.payments import PaymentCreate, PaymentResponse
from database.models import Invoice, InvoiceStatus, Payment, User, UserRole

router = APIRouter(prefix="/payments", tags=["Payments & Collections"])


@router.post(
    "",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Record Payment",
    description="Records payment against an invoice with payment method, amount, date, and note; auto-updates invoice balance and marks as Paid when fully settled.",
)
@router.post(
    "/",
    response_model=PaymentResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
def record_payment(
    req: PaymentCreate,
    db: Session = Depends(get_db),
    user: User = Depends(require_staff_or_admin),
):
    invoice = db.query(Invoice).filter(Invoice.id == req.invoice_id).first()
    if not invoice:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    if invoice.status == InvoiceStatus.CANCELLED:
        raise HTTPException(status_code=400, detail="Cannot record payment against a cancelled invoice.")

    now = datetime.now(timezone.utc)
    payment_dt = req.payment_date or now

    count = db.query(Payment).count() + 1
    payment_number = f"PAY-{now.year}-{count:04d}"

    payment = Payment(
        payment_number=payment_number,
        invoice_id=invoice.id,
        payment_method=req.payment_method,
        amount=req.amount,
        payment_date=payment_dt,
        reference_number=req.reference_number,
        note=req.note,
    )
    db.add(payment)

    # Reconcile invoice paid amount
    invoice.paid_amount += req.amount
    if invoice.paid_amount >= invoice.total_amount:
        invoice.status = InvoiceStatus.PAID

    db.commit()
    db.refresh(payment)
    return payment


@router.get(
    "",
    response_model=List[PaymentResponse],
    summary="List Payments",
    description="Returns recorded payments. Scoped to customer if customer user.",
)
@router.get(
    "/",
    response_model=List[PaymentResponse],
    include_in_schema=False,
)
def list_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Payment).join(Invoice, Payment.invoice_id == Invoice.id)

    if current_user.role == UserRole.CUSTOMER:
        if not current_user.customer_id:
            return []
        query = query.filter(Invoice.customer_id == current_user.customer_id)

    return query.order_by(Payment.payment_date.desc()).all()
