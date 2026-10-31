"""
Discount schemas for Brightloop 360.
"""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field

from database.models.discount import DiscountScope, DiscountType


class DiscountRuleCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255, example="Volume Seats Discount")
    code: Optional[str] = Field(default=None, example="SEATS10")
    discount_type: DiscountType = Field(default=DiscountType.PERCENTAGE)
    value: Decimal = Field(ge=Decimal("0.00"), example="15.00")
    min_purchase_amount: Optional[Decimal] = None
    min_quantity: Optional[int] = Field(default=None, ge=1)
    start_date: datetime
    end_date: Optional[datetime] = None
    max_uses: Optional[int] = Field(default=None, ge=1)
    scope: DiscountScope = Field(default=DiscountScope.WHOLE_SUBSCRIPTION)
    product_id: Optional[uuid.UUID] = None
    is_active: bool = True


class DiscountRuleResponse(BaseModel):
    id: uuid.UUID
    name: str
    code: Optional[str]
    discount_type: DiscountType
    value: Decimal
    min_purchase_amount: Optional[Decimal]
    min_quantity: Optional[int]
    start_date: datetime
    end_date: Optional[datetime]
    max_uses: Optional[int]
    current_uses: int
    scope: DiscountScope
    product_id: Optional[uuid.UUID]
    is_active: bool

    class Config:
        from_attributes = True


class DiscountEvaluationRequest(BaseModel):
    subtotal: Decimal
    quantity: int
    product_id: Optional[uuid.UUID] = None
    code: Optional[str] = None


class DiscountEvaluationResponse(BaseModel):
    is_eligible: bool
    discount_rule_name: Optional[str]
    discount_amount: Decimal
    final_amount: Decimal
