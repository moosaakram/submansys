"""
Plan schemas for Brightloop 360.
"""

import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional
from pydantic import BaseModel, Field

from database.models.plan import PlanBillingCycle


class PlanCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255, example="Pro Monthly Subscription")
    description: Optional[str] = None
    product_id: Optional[uuid.UUID] = None
    cost: Decimal = Field(ge=Decimal("0.00"), example="1200.00")
    billing_cycle: PlanBillingCycle = Field(default=PlanBillingCycle.MONTHLY)
    minimum_quantity: int = Field(default=1, ge=1)
    start_date: datetime
    end_date: Optional[datetime] = None
    auto_close: bool = Field(default=False, description="Closes automatically when period/end_date expires")
    allow_early_close: bool = True
    allow_pause: bool = True
    allow_renew: bool = True
    is_active: bool = True


class PlanUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    cost: Optional[Decimal] = None
    minimum_quantity: Optional[int] = None
    end_date: Optional[datetime] = None
    auto_close: Optional[bool] = None
    allow_early_close: Optional[bool] = None
    allow_pause: Optional[bool] = None
    allow_renew: Optional[bool] = None
    is_active: Optional[bool] = None


class PlanResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    product_id: Optional[uuid.UUID]
    cost: Decimal
    billing_cycle: PlanBillingCycle
    minimum_quantity: int
    start_date: datetime
    end_date: Optional[datetime]
    auto_close: bool
    allow_early_close: bool
    allow_pause: bool
    allow_renew: bool
    is_active: bool

    class Config:
        from_attributes = True
