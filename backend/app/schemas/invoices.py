"""
Invoice schemas for Brightloop 360.
"""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel

from database.models.invoice import InvoiceStatus


class InvoiceLineResponse(BaseModel):
    id: uuid.UUID
    product_id: Optional[uuid.UUID]
    product_name: str
    variant_name: Optional[str]
    quantity: int
    unit_price: Decimal
    tax_rate: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    line_total: Decimal

    class Config:
        from_attributes = True


class InvoiceResponse(BaseModel):
    id: uuid.UUID
    invoice_number: str
    subscription_id: Optional[uuid.UUID]
    customer_id: uuid.UUID
    customer_name: str
    customer_email: str
    issue_date: datetime
    due_date: datetime
    status: InvoiceStatus
    subtotal: Decimal
    tax_amount: Decimal
    discount_amount: Decimal
    total_amount: Decimal
    paid_amount: Decimal
    outstanding_amount: Decimal
    is_overdue: bool
    sent_at: Optional[datetime]
    notes: Optional[str]
    lines: List[InvoiceLineResponse] = []

    class Config:
        from_attributes = True


class InvoicePrintResponse(BaseModel):
    invoice_number: str
    status: str
    issue_date: str
    due_date: str
    customer_name: str
    customer_email: str
    subtotal: str
    tax_amount: str
    discount_amount: str
    total_amount: str
    paid_amount: str
    balance_due: str
    lines: List[dict]
    printable_text: str


class RecurringBillingRunResponse(BaseModel):
    status: str = "success"
    message: str
    invoices_generated: int
    generated_invoices: List[InvoiceResponse]
