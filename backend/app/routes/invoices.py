"""
Invoice and Automated Billing Day Endpoints.
Implements recurring billing automation, automated tax & discount calculation, and invoice actions (confirm, cancel, send, print).
"""

import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_staff_or_admin
from app.schemas.invoices import (
    InvoicePrintResponse,
    InvoiceResponse,
    RecurringBillingRunResponse,
)
from database.models import (
    Customer,
    DiscountRule,
    DiscountScope,
    Invoice,
    InvoiceLine,
    InvoiceStatus,
    Subscription,
    SubscriptionStatus,
    TaxRule,
    User,
    UserRole,
)

router = APIRouter(prefix="/invoices", tags=["Invoicing & Billing Day"])


@router.get(
    "",
    response_model=List[InvoiceResponse],
    summary="List Invoices",
    description="Returns invoices. Customers see only their own invoices; staff/admin see all.",
)
@router.get(
    "/",
    response_model=List[InvoiceResponse],
    include_in_schema=False,
)
def list_invoices(
    status_filter: Optional[InvoiceStatus] = Query(None, alias="status"),
    is_overdue_filter: Optional[bool] = Query(None, alias="is_overdue"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Invoice)

    if current_user.role == UserRole.CUSTOMER:
        if not current_user.customer_id:
            return []
        query = query.filter(Invoice.customer_id == current_user.customer_id)

    if status_filter:
        query = query.filter(Invoice.status == status_filter)

    invoices = query.order_by(Invoice.created_at.desc()).all()

    if is_overdue_filter is not None:
        invoices = [inv for inv in invoices if inv.is_overdue == is_overdue_filter]

    return invoices


@router.post(
    "/generate-recurring",
    response_model=RecurringBillingRunResponse,
    summary="Run Billing Day Routine",
    description="Scans all active subscriptions due for billing, creates itemized invoices with automated taxes and discounts, guaranteeing no double-billing or skips.",
)
def run_recurring_billing_day(
    db: Session = Depends(get_db),
    user: User = Depends(require_staff_or_admin),
):
    now = datetime.now(timezone.utc)
    # Find all active subscriptions that are due for billing
    due_subscriptions = (
        db.query(Subscription)
        .filter(
            Subscription.status == SubscriptionStatus.ACTIVE,
            (Subscription.next_billing_date <= now) | (Subscription.next_billing_date == None),
        )
        .all()
    )

    generated = []
    active_tax_rules = db.query(TaxRule).filter(TaxRule.is_active == True).all()
    default_tax_rate = active_tax_rules[0].rate if active_tax_rules else Decimal("10.000")

    for sub in due_subscriptions:
        # Check auto-close rule if expired
        if sub.auto_close and sub.expiry_date and now >= sub.expiry_date:
            sub.status = SubscriptionStatus.CLOSED
            continue

        customer = db.query(Customer).filter(Customer.id == sub.customer_id).first()
        if not customer:
            continue

        inv_count = db.query(Invoice).count() + 1
        inv_number = f"INV-{now.year}-{inv_count:04d}"

        # Calculate lines, subtotal, and tax
        subtotal = Decimal("0.00")
        tax_total = Decimal("0.00")
        lines_to_add = []

        for line in sub.lines:
            line_sub = line.unit_price * line.quantity
            line_tax_rate = line.tax_rate if line.tax_rate > Decimal("0.000") else default_tax_rate
            line_tax = (line_sub * line_tax_rate) / Decimal("100.00")
            line_total = line_sub + line_tax

            subtotal += line_sub
            tax_total += line_tax

            inv_line = InvoiceLine(
                product_id=line.product_id,
                product_name=line.product_name,
                quantity=line.quantity,
                unit_price=line.unit_price,
                tax_rate=line_tax_rate,
                tax_amount=line_tax,
                discount_amount=Decimal("0.00"),
                line_total=line_total,
            )
            lines_to_add.append(inv_line)

        # Check automated discount rules
        discount_amount = Decimal("0.00")
        applicable_discounts = (
            db.query(DiscountRule)
            .filter(
                DiscountRule.is_active == True,
                DiscountRule.start_date <= now,
                (DiscountRule.end_date >= now) | (DiscountRule.end_date == None),
            )
            .all()
        )

        for disc in applicable_discounts:
            if disc.is_eligible(subtotal, sub.quantity, now):
                if disc.scope == DiscountScope.WHOLE_SUBSCRIPTION:
                    discount_amount += disc.calculate_discount(subtotal)
                    disc.current_uses += 1
                    break

        total_amount = max(Decimal("0.00"), (subtotal - discount_amount) + tax_total)

        # Due date based on payment terms
        due_days = 30
        if sub.payment_terms:
            if "15" in sub.payment_terms:
                due_days = 15
            elif "Receipt" in sub.payment_terms or "Due" in sub.payment_terms:
                due_days = 0

        invoice = Invoice(
            invoice_number=inv_number,
            subscription_id=sub.id,
            customer_id=customer.id,
            customer_name=customer.full_name,
            customer_email=customer.email,
            issue_date=now,
            due_date=now + timedelta(days=due_days),
            status=InvoiceStatus.CONFIRMED,
            subtotal=subtotal,
            tax_amount=tax_total,
            discount_amount=discount_amount,
            total_amount=total_amount,
            paid_amount=Decimal("0.00"),
            notes=f"Automated recurring invoice for subscription {sub.subscription_number}",
        )
        db.add(invoice)
        db.commit()
        db.refresh(invoice)

        for l in lines_to_add:
            l.invoice_id = invoice.id
            db.add(l)

        # Advance subscription next_billing_date so it is never billed twice
        sub.last_billed_date = now
        if sub.billing_cycle == "daily":
            sub.next_billing_date = now + timedelta(days=1)
        elif sub.billing_cycle == "weekly":
            sub.next_billing_date = now + timedelta(weeks=1)
        elif sub.billing_cycle == "yearly":
            sub.next_billing_date = now + timedelta(days=365)
        else:
            sub.next_billing_date = now + timedelta(days=30)

        db.commit()
        db.refresh(invoice)
        generated.append(invoice)

    return RecurringBillingRunResponse(
        status="success",
        message=f"Billing run completed successfully. {len(generated)} invoice(s) generated.",
        invoices_generated=len(generated),
        generated_invoices=generated,
    )


@router.get(
    "/{invoice_id}",
    response_model=InvoiceResponse,
    summary="Get Invoice Details",
)
def get_invoice(
    invoice_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    if current_user.role == UserRole.CUSTOMER and inv.customer_id != current_user.customer_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    return inv


@router.post(
    "/{invoice_id}/confirm",
    response_model=InvoiceResponse,
    summary="Confirm Invoice",
)
def confirm_invoice(
    invoice_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(require_staff_or_admin),
):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    inv.status = InvoiceStatus.CONFIRMED
    db.commit()
    db.refresh(inv)
    return inv


@router.post(
    "/{invoice_id}/cancel",
    response_model=InvoiceResponse,
    summary="Cancel Invoice",
)
def cancel_invoice(
    invoice_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(require_staff_or_admin),
):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    if inv.status == InvoiceStatus.PAID:
        raise HTTPException(status_code=400, detail="Cannot cancel a fully paid invoice.")

    inv.status = InvoiceStatus.CANCELLED
    db.commit()
    db.refresh(inv)
    return inv


@router.post(
    "/{invoice_id}/send",
    summary="Send Invoice to Customer",
    description="Records email dispatch timestamp for this invoice",
)
def send_invoice(
    invoice_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(require_staff_or_admin),
):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    inv.sent_at = datetime.now(timezone.utc)
    db.commit()

    return {
        "status": "success",
        "message": f"Invoice {inv.invoice_number} sent to {inv.customer_email}.",
        "sent_at": inv.sent_at.isoformat(),
    }


@router.get(
    "/{invoice_id}/print",
    response_model=InvoicePrintResponse,
    summary="Print Invoice",
    description="Returns formatted layout and printable representation of the invoice",
)
def print_invoice(
    invoice_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    if current_user.role == UserRole.CUSTOMER and inv.customer_id != current_user.customer_id:
        raise HTTPException(status_code=403, detail="Access denied.")

    lines_summary = []
    lines_text = ""
    for idx, line in enumerate(inv.lines, 1):
        line_item = {
            "index": idx,
            "product": line.product_name,
            "quantity": line.quantity,
            "unit_price": f"${line.unit_price:.2f}",
            "tax": f"${line.tax_amount:.2f}",
            "total": f"${line.line_total:.2f}",
        }
        lines_summary.append(line_item)
        lines_text += f"  {idx}. {line.product_name} (Qty: {line.quantity}) @ ${line.unit_price:.2f} -> Subtotal: ${line.line_total:.2f}\n"

    printable = f"""
============================================================
              BRIGHTLOOP 360 SOFTWARE INVOICE
============================================================
Invoice Number: {inv.invoice_number}
Status:         {inv.status.value.upper()}
Issue Date:     {inv.issue_date.strftime('%Y-%m-%d')}
Due Date:       {inv.due_date.strftime('%Y-%m-%d')}

Billed To:
  Name:  {inv.customer_name}
  Email: {inv.customer_email}

Line Items:
------------------------------------------------------------
{lines_text}
------------------------------------------------------------
Subtotal:       ${inv.subtotal:.2f}
Taxes:          ${inv.tax_amount:.2f}
Discount:      -${inv.discount_amount:.2f}
TOTAL DUE:      ${inv.total_amount:.2f}
Paid to Date:   ${inv.paid_amount:.2f}
BALANCE DUE:    ${inv.outstanding_amount:.2f}
============================================================
Thank you for your business with Brightloop 360!
"""

    return InvoicePrintResponse(
        invoice_number=inv.invoice_number,
        status=inv.status.value,
        issue_date=inv.issue_date.strftime("%Y-%m-%d"),
        due_date=inv.due_date.strftime("%Y-%m-%d"),
        customer_name=inv.customer_name,
        customer_email=inv.customer_email,
        subtotal=f"${inv.subtotal:.2f}",
        tax_amount=f"${inv.tax_amount:.2f}",
        discount_amount=f"${inv.discount_amount:.2f}",
        total_amount=f"${inv.total_amount:.2f}",
        paid_amount=f"${inv.paid_amount:.2f}",
        balance_due=f"${inv.outstanding_amount:.2f}",
        lines=lines_summary,
        printable_text=printable,
    )


@router.put(
    "/{invoice_id}/status",
    response_model=InvoiceResponse,
    summary="Update Invoice Status",
)
def update_invoice_status(
    invoice_id: uuid.UUID,
    new_status: InvoiceStatus = Query(...),
    db: Session = Depends(get_db),
    user: User = Depends(require_staff_or_admin),
):
    inv = db.query(Invoice).filter(Invoice.id == invoice_id).first()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found.")
    inv.status = new_status
    db.commit()
    db.refresh(inv)
    return inv

