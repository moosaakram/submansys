"""
Product and Product Variant schemas for Brightloop 360.
"""

import uuid
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, Field


class ProductVariantCreate(BaseModel):
    attribute_name: str = Field(example="Brand")
    attribute_value: str = Field(example="Odoo")
    price_extra: Decimal = Field(default=Decimal("0.00"), example="560.00")
    is_active: bool = True


class ProductVariantResponse(BaseModel):
    id: uuid.UUID
    product_id: uuid.UUID
    attribute_name: str
    attribute_value: str
    price_extra: Decimal
    is_active: bool

    class Config:
        from_attributes = True


class ProductCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255, example="Brightloop ERP Software")
    description: Optional[str] = None
    product_type: str = Field(default="recurring", example="recurring")
    sales_price: Decimal = Field(ge=Decimal("0.00"), example="1200.00")
    cost_price: Decimal = Field(default=Decimal("0.00"), ge=Decimal("0.00"), example="400.00")
    is_active: bool = True
    variants: Optional[List[ProductVariantCreate]] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    product_type: Optional[str] = None
    sales_price: Optional[Decimal] = None
    cost_price: Optional[Decimal] = None
    is_active: Optional[bool] = None


class ProductResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    product_type: str
    sales_price: Decimal
    cost_price: Decimal
    is_active: bool
    variants: List[ProductVariantResponse] = []

    class Config:
        from_attributes = True
