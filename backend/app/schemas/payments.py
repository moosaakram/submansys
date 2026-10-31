"""
Payment schemas for Brightloop 360.
"""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field


class PaymentCreate(BaseModel):
    invoice_id: uuid.UUID
    payment_method: str = Field(default="credit_card", example="bank_transfer")
    amount: Decimal = Field(gt=Decimal("0.00"), example="1200.00")
    payment_date: Optional[datetime] = None
    reference_number: Optional[str] = Field(default=None, example="TXN-9842187")
    note: Optional[str] = Field(default=None, example="Paid via wire transfer")


class PaymentResponse(BaseModel):
    id: uuid.UUID
    payment_number: str
    invoice_id: uuid.UUID
    payment_method: str
    amount: Decimal
    payment_date: datetime
    reference_number: Optional[str]
    note: Optional[str]

    class Config:
        from_attributes = True
