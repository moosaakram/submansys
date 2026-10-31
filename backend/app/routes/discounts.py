"""
Discount Rules Endpoints.
Admin creates discount rules with thresholds, limits, dates, and scope.
Includes automated evaluation endpoint.
"""

from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.schemas.discounts import (
    DiscountEvaluationRequest,
    DiscountEvaluationResponse,
    DiscountRuleCreate,
    DiscountRuleResponse,
)
from database.models import DiscountRule, DiscountScope

router = APIRouter(prefix="/discounts", tags=["Discount Rules"])


@router.get(
    "/",
    response_model=List[DiscountRuleResponse],
    summary="List Discount Rules",
)
def list_discounts(is_active: Optional[bool] = None, db: Session = Depends(get_db)):
    query = db.query(DiscountRule)
    if is_active is not None:
        query = query.filter(DiscountRule.is_active == is_active)
    return query.all()


@router.post(
    "/",
    response_model=DiscountRuleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Discount Rule (Admin Only)",
    description="Only Admin can create discount rules with fixed/percentage value, minimum purchase/quantity thresholds, validity dates, usage limit, and product or subscription scope.",
)
def create_discount_rule(
    req: DiscountRuleCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    if req.code:
        existing = db.query(DiscountRule).filter(DiscountRule.code == req.code.upper()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Discount rule with code '{req.code}' already exists.",
            )

    rule = DiscountRule(
        name=req.name,
        code=req.code.upper() if req.code else None,
        discount_type=req.discount_type,
        value=req.value,
        min_purchase_amount=req.min_purchase_amount,
        min_quantity=req.min_quantity,
        start_date=req.start_date,
        end_date=req.end_date,
        max_uses=req.max_uses,
        current_uses=0,
        scope=req.scope,
        product_id=req.product_id,
        is_active=req.is_active,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule


@router.post(
    "/evaluate",
    response_model=DiscountEvaluationResponse,
    summary="Evaluate Discount Eligibility",
    description="Calculates applicable discount reduction based on purchase amount, seat quantity, and active rules",
)
def evaluate_discount(
    req: DiscountEvaluationRequest,
    db: Session = Depends(get_db),
):
    now = datetime.now(timezone.utc)
    query = db.query(DiscountRule).filter(
        DiscountRule.is_active == True,
        DiscountRule.start_date <= now,
        (DiscountRule.end_date >= now) | (DiscountRule.end_date == None),
    )

    if req.code:
        query = query.filter(DiscountRule.code == req.code.upper())

    rules = query.all()
    for rule in rules:
        if rule.is_eligible(req.subtotal, req.quantity, now):
            discount_amount = rule.calculate_discount(req.subtotal)
            return DiscountEvaluationResponse(
                is_eligible=True,
                discount_rule_name=rule.name,
                discount_amount=discount_amount,
                final_amount=max(Decimal("0.00"), req.subtotal - discount_amount),
            )

    return DiscountEvaluationResponse(
        is_eligible=False,
        discount_rule_name=None,
        discount_amount=Decimal("0.00"),
        final_amount=req.subtotal,
    )
