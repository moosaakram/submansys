"""
Quotation Template Endpoints.
Allows sales reps to utilize templates with preset plans, lines, and validity periods.
"""

import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import require_staff_or_admin
from app.schemas.quotations import (
    QuotationTemplateCreate,
    QuotationTemplateResponse,
)
from database.models import QuotationTemplate, QuotationTemplateLine

router = APIRouter(prefix="/quotation-templates", tags=["Quotation Templates"])


@router.get(
    "/",
    response_model=List[QuotationTemplateResponse],
    summary="List Quotation Templates",
)
def list_quotation_templates(db: Session = Depends(get_db)):
    return db.query(QuotationTemplate).all()


@router.post(
    "/",
    response_model=QuotationTemplateResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Quotation Template (Staff or Admin)",
)
def create_quotation_template(
    req: QuotationTemplateCreate,
    db: Session = Depends(get_db),
    user=Depends(require_staff_or_admin),
):
    template = QuotationTemplate(
        name=req.name,
        plan_id=req.plan_id,
        validity_days=req.validity_days,
        notes=req.notes,
    )
    db.add(template)
    db.commit()
    db.refresh(template)

    for line in req.lines:
        tmpl_line = QuotationTemplateLine(
            template_id=template.id,
            product_id=line.product_id,
            variant_id=line.variant_id,
            quantity=line.quantity,
            unit_price=line.unit_price,
        )
        db.add(tmpl_line)

    db.commit()
    db.refresh(template)
    return template


@router.get(
    "/{template_id}",
    response_model=QuotationTemplateResponse,
    summary="Get Quotation Template",
)
def get_quotation_template(template_id: uuid.UUID, db: Session = Depends(get_db)):
    template = db.query(QuotationTemplate).filter(QuotationTemplate.id == template_id).first()
    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quotation template not found.",
        )
    return template
