"""
Quotation Template Model for Brightloop 360.
Allows sales reps to quickly instantiate quotes with predefined plans, lines, and validity periods.
"""

import uuid
from decimal import Decimal
from typing import List, Optional
from sqlalchemy import ForeignKey, Integer, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class QuotationTemplate(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Standardized template for fast quotation generation.
    """
    __tablename__ = "quotation_templates"

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        comment="Template title (e.g., Enterprise Bundle Template)",
    )

    plan_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("plans.id", ondelete="SET NULL"),
        nullable=True,
        comment="Associated default subscription plan",
    )

    validity_days: Mapped[int] = mapped_column(
        Integer,
        default=30,
        nullable=False,
        comment="Number of days the quote generated from this template remains valid",
    )

    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Default customer or internal notes",
    )

    # Relationships
    lines: Mapped[List["QuotationTemplateLine"]] = relationship(
        "QuotationTemplateLine",
        back_populates="template",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class QuotationTemplateLine(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Predefined product line items within a quotation template.
    """
    __tablename__ = "quotation_template_lines"

    template_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("quotation_templates.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
    )

    variant_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("product_variants.id", ondelete="SET NULL"),
        nullable=True,
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )

    unit_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=Decimal("0.00"),
        nullable=False,
    )

    template: Mapped["QuotationTemplate"] = relationship(
        "QuotationTemplate",
        back_populates="lines",
    )
