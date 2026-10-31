"""
Quotation Template Models for Brightloop 360.
Allows sales reps to quickly generate offers from pre-configured plans and product lines.
"""

import uuid
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Integer, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from database.models.plan import Plan
    from database.models.product import Product
    from database.models.product_variant import ProductVariant


class QuotationTemplate(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Standard offer blueprint containing pre-selected plan, line items, and validity duration.
    """

    __tablename__ = "quotation_templates"

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        unique=True,
        comment="Template identifier (e.g., 'Enterprise 10-Seat Cloud Package')",
    )

    plan_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("plans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Associated billing plan",
    )

    validity_days: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=30,
        comment="Number of days this quotation offer remains valid after drafting",
    )

    payment_terms: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="Net 30",
        comment="Standard payment terms (e.g., 'Immediate', 'Net 15', 'Net 30')",
    )

    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Terms and conditions or internal notes",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="Indicates whether this template is active for creating quotes",
    )

    # Relationships
    plan: Mapped["Plan"] = relationship(
        "Plan",
        back_populates="quotation_templates",
    )

    lines: Mapped[List["QuotationTemplateLine"]] = relationship(
        "QuotationTemplateLine",
        back_populates="template",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        CheckConstraint("validity_days > 0", name="chk_quotation_template_validity_positive"),
    )

    def __repr__(self) -> str:
        return f"<QuotationTemplate(id={self.id!r}, name={self.name!r}, validity_days={self.validity_days})>"


class QuotationTemplateLine(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Individual product line within a quotation template.
    """

    __tablename__ = "quotation_template_lines"

    template_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("quotation_templates.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Parent quotation template reference",
    )

    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Product item",
    )

    variant_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("product_variants.id", ondelete="SET NULL"),
        nullable=True,
        comment="Optional variant selection (e.g. brand modifier)",
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        comment="Default quantity for this line item",
    )

    unit_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Agreed template unit price",
    )

    # Relationships
    template: Mapped["QuotationTemplate"] = relationship(
        "QuotationTemplate",
        back_populates="lines",
    )

    product: Mapped["Product"] = relationship("Product")
    variant: Mapped[Optional["ProductVariant"]] = relationship("ProductVariant")

    __table_args__ = (
        CheckConstraint("quantity > 0", name="chk_quotation_line_quantity_positive"),
        CheckConstraint("unit_price >= 0", name="chk_quotation_line_unit_price_non_negative"),
    )

    def __repr__(self) -> str:
        return (
            f"<QuotationTemplateLine(id={self.id!r}, template_id={self.template_id!r}, "
            f"product_id={self.product_id!r}, qty={self.quantity}, unit_price={self.unit_price})>"
        )

