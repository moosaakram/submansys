"""
Payment Terms API Endpoints.
Manages credit and due terms (Net 30, Net 15, Due on Receipt) for quotes, sales orders, and invoices.
"""

import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_admin, require_staff_or_admin
from database.models import PaymentTerm

router = APIRouter(prefix="/payment-terms", tags=["Payment Terms"])


class PaymentTermCreate(BaseModel):
    name: str = Field(..., max_length=100)
    days_due: int = Field(default=30, ge=0)
    description: Optional[str] = None
    is_default: bool = False
    is_active: bool = True


class PaymentTermResponse(BaseModel):
    id: uuid.UUID
    name: str
    days_due: int
    description: Optional[str]
    is_default: bool
    is_active: bool

    class Config:
        from_attributes = True


@router.get("", response_model=List[PaymentTermResponse])
@router.get("/", response_model=List[PaymentTermResponse], include_in_schema=False)
def list_payment_terms(db: Session = Depends(get_db)):
    """List all active payment terms."""
    return db.query(PaymentTerm).filter(PaymentTerm.is_active == True).order_by(PaymentTerm.days_due.asc()).all()


@router.post("", response_model=PaymentTermResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=PaymentTermResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_payment_term(
    req: PaymentTermCreate,
    db: Session = Depends(get_db),
    admin=Depends(require_admin),
):
    """Create a new payment term (Admin only)."""
    existing = db.query(PaymentTerm).filter(PaymentTerm.name == req.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Payment term with name '{req.name}' already exists.",
        )

    if req.is_default:
        db.query(PaymentTerm).filter(PaymentTerm.is_default == True).update({"is_default": False})

    term = PaymentTerm(
        name=req.name,
        days_due=req.days_due,
        description=req.description,
        is_default=req.is_default,
        is_active=req.is_active,
    )
    db.add(term)
    db.commit()
    db.refresh(term)
    return term
