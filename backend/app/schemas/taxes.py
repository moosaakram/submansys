"""
Tax Rule schemas for Brightloop 360.
"""

import uuid
from decimal import Decimal
from pydantic import BaseModel, Field


class TaxRuleCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100, example="Standard VAT (10%)")
    rate: Decimal = Field(ge=Decimal("0.000"), example="10.000")
    is_active: bool = True


class TaxRuleResponse(BaseModel):
    id: uuid.UUID
    name: str
    rate: Decimal
    is_active: bool

    class Config:
        from_attributes = True
