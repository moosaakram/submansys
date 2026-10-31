"""
Quotation Template schemas for Brightloop 360.
"""

import uuid
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field


class QuotationTemplateLineCreate(BaseModel):
    product_id: uuid.UUID
    variant_id: Optional[uuid.UUID] = None
    quantity: int = Field(default=1, ge=1)
    unit_price: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"))


class QuotationTemplateLineResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    variant_id: Optional[uuid.UUID]
    quantity: int
    unit_price: Decimal

    class Config:
        from_attributes = True


class QuotationTemplateCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    plan_id: Optional[uuid.UUID] = None
    validity_days: int = Field(default=30, ge=1)
    notes: Optional[str] = None
    lines: List[QuotationTemplateLineCreate] = []


class QuotationTemplateResponse(BaseModel):
    id: uuid.UUID
    name: str
    plan_id: Optional[uuid.UUID]
    validity_days: int
    notes: Optional[str]
    lines: List[QuotationTemplateLineResponse] = []

    class Config:
        from_attributes = True
