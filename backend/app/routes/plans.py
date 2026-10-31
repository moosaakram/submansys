"""
Subscription Plan Endpoints.
Configured by Admin: costs, recurrence, minimum quantity, dates, and lifecycle settings (auto-close, early close, pause, renew).
"""

import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.schemas.plans import PlanCreate, PlanResponse, PlanUpdate
from database.models import Plan

router = APIRouter(prefix="/plans", tags=["Subscription Plans"])


@router.get(
    "/",
    response_model=List[PlanResponse],
    summary="List Plans",
    description="Returns all subscription plans available in the catalog",
)
def list_plans(is_active: Optional[bool] = None, db: Session = Depends(get_db)):
    query = db.query(Plan)
    if is_active is not None:
        query = query.filter(Plan.is_active == is_active)
    return query.all()


@router.post(
    "/",
    response_model=PlanResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Plan (Admin Only)",
    description="Admin creates a subscription plan with pricing, billing cycle, minimum quantity, validity dates, and lifecycle rules",
)
def create_plan(
    req: PlanCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    plan = Plan(
        name=req.name,
        description=req.description,
        product_id=req.product_id,
        cost=req.cost,
        billing_cycle=req.billing_cycle,
        minimum_quantity=req.minimum_quantity,
        start_date=req.start_date,
        end_date=req.end_date,
        auto_close=req.auto_close,
        allow_early_close=req.allow_early_close,
        allow_pause=req.allow_pause,
        allow_renew=req.allow_renew,
        is_active=req.is_active,
    )
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return plan


@router.get(
    "/{plan_id}",
    response_model=PlanResponse,
    summary="Get Plan Details",
)
def get_plan(plan_id: uuid.UUID, db: Session = Depends(get_db)):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found.",
        )
    return plan


@router.put(
    "/{plan_id}",
    response_model=PlanResponse,
    summary="Update Plan (Admin Only)",
)
def update_plan(
    plan_id: uuid.UUID,
    req: PlanUpdate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    plan = db.query(Plan).filter(Plan.id == plan_id).first()
    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found.",
        )

    for field, value in req.model_dump(exclude_unset=True).items():
        setattr(plan, field, value)

    db.commit()
    db.refresh(plan)
    return plan
