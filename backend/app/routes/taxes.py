"""
Tax Rules Endpoints.
Configured by Admin for automated tax calculations on subscriptions and invoices.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.schemas.taxes import TaxRuleCreate, TaxRuleResponse
from database.models import TaxRule

router = APIRouter(prefix="/taxes", tags=["Tax Rules"])


@router.get(
    "/",
    response_model=List[TaxRuleResponse],
    summary="List Tax Rules",
)
def list_tax_rules(db: Session = Depends(get_db)):
    return db.query(TaxRule).all()


@router.post(
    "/",
    response_model=TaxRuleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Tax Rule (Admin Only)",
)
def create_tax_rule(
    req: TaxRuleCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    existing = db.query(TaxRule).filter(TaxRule.name == req.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Tax rule with name '{req.name}' already exists.",
        )

    rule = TaxRule(name=req.name, rate=req.rate, is_active=req.is_active)
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return rule
