"""
Product and Product Variant Endpoints.
Admin adds products, sales price, cost price, notes, and variants (e.g. Odoo brand adds +560).
"""

import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.schemas.products import (
    ProductCreate,
    ProductResponse,
    ProductUpdate,
    ProductVariantCreate,
    ProductVariantResponse,
)
from database.models import Product, ProductVariant

router = APIRouter(prefix="/products", tags=["Products & Variants"])


@router.get(
    "/",
    response_model=List[ProductResponse],
    summary="List Products",
    description="Returns all catalog products with their variants",
)
def list_products(
    is_active: Optional[bool] = None,
    product_type: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Product)
    if is_active is not None:
        query = query.filter(Product.is_active == is_active)
    if product_type:
        query = query.filter(Product.product_type == product_type)
    return query.all()


@router.post(
    "/",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Product (Admin Only)",
    description="Admin creates a new product with name, type, sales price, cost price, notes, and variants",
)
def create_product(
    req: ProductCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    product = Product(
        name=req.name,
        description=req.description,
        product_type=req.product_type,
        sales_price=req.sales_price,
        cost_price=req.cost_price,
        is_active=req.is_active,
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    if req.variants:
        for v in req.variants:
            variant = ProductVariant(
                product_id=product.id,
                attribute_name=v.attribute_name,
                attribute_value=v.attribute_value,
                price_extra=v.price_extra,
                is_active=v.is_active,
            )
            db.add(variant)
        db.commit()
        db.refresh(product)

    return product


@router.get(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Get Product",
    description="Returns detailed product info including all variants",
)
def get_product(product_id: uuid.UUID, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Product with ID '{product_id}' not found.",
        )
    return product


@router.put(
    "/{product_id}",
    response_model=ProductResponse,
    summary="Update Product (Admin Only)",
    description="Updates existing product details and pricing",
)
def update_product(
    product_id: uuid.UUID,
    req: ProductUpdate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return product


@router.post(
    "/{product_id}/variants",
    response_model=ProductVariantResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add Variant to Product (Admin Only)",
    description="Adds a new variant with an extra price delta (e.g. Odoo brand adds +560)",
)
def add_product_variant(
    product_id: uuid.UUID,
    req: ProductVariantCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )

    variant = ProductVariant(
        product_id=product_id,
        attribute_name=req.attribute_name,
        attribute_value=req.attribute_value,
        price_extra=req.price_extra,
        is_active=req.is_active,
    )
    db.add(variant)
    db.commit()
    db.refresh(variant)
    return variant


@router.delete(
    "/{product_id}",
    summary="Delete Product (Admin Only)",
    description="Deletes a product from the catalog",
)
def delete_product(
    product_id: uuid.UUID,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found.",
        )
    db.delete(product)
    db.commit()
    return {"status": "success", "message": f"Product '{product.name}' deleted successfully."}

