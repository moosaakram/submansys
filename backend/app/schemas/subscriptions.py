"""
Subscription schemas for Brightloop 360.
"""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field

from database.models.subscription import BillingCycle, SubscriptionStatus


class SubscriptionLineCreate(BaseModel):
    product_id: uuid.UUID
    variant_id: Optional[uuid.UUID] = None
    quantity: int = Field(default=1, ge=1)
    unit_price: Optional[Decimal] = None
    tax_rate: Optional[Decimal] = Field(default=Decimal("0.000"), ge=Decimal("0.000"))


class SubscriptionLineResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    variant_id: Optional[uuid.UUID]
    product_name: str
    quantity: int
    unit_price: Decimal
    tax_rate: Decimal
    amount: Decimal

    class Config:
        from_attributes = True


class SubscriptionCreate(BaseModel):
    customer_id: uuid.UUID
    plan_id: Optional[uuid.UUID] = None
    billing_cycle: Optional[BillingCycle] = BillingCycle.MONTHLY
    start_date: Optional[datetime] = None
    expiry_date: Optional[datetime] = None
    payment_terms: Optional[str] = "Net 30"
    payment_method: Optional[str] = "credit_card"
    lines: List[SubscriptionLineCreate]
    notes: Optional[str] = None


class SubscriptionResponse(BaseModel):
    id: uuid.UUID
    subscription_number: str
    customer_id: uuid.UUID
    plan_id: Optional[uuid.UUID]
    billing_cycle: BillingCycle
    quantity: int
    unit_price: Decimal
    total_amount: Decimal
    start_date: datetime
    expiry_date: Optional[datetime]
    payment_terms: Optional[str]
    payment_method: Optional[str]
    status: SubscriptionStatus
    last_billed_date: Optional[datetime]
    next_billing_date: Optional[datetime]
    auto_close: bool
    allow_early_close: bool
    allow_pause: bool
    allow_renew: bool
    notes: Optional[str]
    lines: List[SubscriptionLineResponse] = []

    class Config:
        from_attributes = True


class SubscriptionActionResponse(BaseModel):
    status: str = "success"
    message: str
    subscription: SubscriptionResponse
