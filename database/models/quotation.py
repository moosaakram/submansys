"""
Quotation and QuotationItem Models for SubMan / Brightloop 360.
Implements the full Quotation Lifecycle: Draft -> Sent -> Confirmed / Rejected / Expired.
"""

import enum
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
import uuid
from sqlalchemy import (
    CheckConstraint,
    Date,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class QuotationStatus(str, enum.Enum):
    DRAFT = "draft"
    SENT = "sent"
    CONFIRMED = "confirmed"
    REJECTED = "rejected"
    EXPIRED = "expired"


class Quotation(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Formal pricing quotation issued to a prospective or existing client.
    """
    __tablename__ = "quotations"

    quotation_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
        comment="Sequential identifier (e.g. QTN-2026-0001)",
    )

    customer_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("customers.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Associated customer foreign key",
    )

    template_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("quotation_templates.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Source template foreign key (if created from template)",
    )

    payment_term_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("payment_terms.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Agreed payment terms template",
    )

    status: Mapped[QuotationStatus] = mapped_column(
        SAEnum(QuotationStatus, name="quotation_status", native_enum=False),
        nullable=False,
        default=QuotationStatus.DRAFT,
        index=True,
        comment="Lifecycle state: draft, sent, confirmed, rejected, expired",
    )

    valid_until: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        comment="Quotation expiration date",
    )

    subtotal: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Pre-tax, pre-discount lines subtotal in INR (₹)",
    )

    discount_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Total promotional discounts applied in INR (₹)",
    )

    tax_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Total taxes in INR (₹)",
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Final total payable amount in INR (₹)",
    )

    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Commercial terms or delivery notes",
    )

    lines: Mapped[List["QuotationItem"]] = relationship(
        "QuotationItem",
        back_populates="quotation",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        CheckConstraint("subtotal >= 0", name="chk_quotation_subtotal_non_negative"),
        CheckConstraint("discount_amount >= 0", name="chk_quotation_discount_non_negative"),
        CheckConstraint("tax_amount >= 0", name="chk_quotation_tax_non_negative"),
        CheckConstraint("total_amount >= 0", name="chk_quotation_total_non_negative"),
    )


class QuotationItem(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Line item belonging to a commercial quotation, snapshotting catalog values.
    """
    __tablename__ = "quotation_items"

    quotation_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("quotations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Parent quotation foreign key",
    )

    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Quoted product foreign key",
    )

    variant_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("product_variants.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Selected product variant foreign key",
    )

    product_name_snapshot: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Product title snapshot at time of quotation",
    )

    variant_name_snapshot: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Variant title snapshot (e.g., Odoo Brand Integration)",
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        comment="Quoted quantity/seats",
    )

    unit_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        comment="Unit price (base + variant adjustment)",
    )

    line_subtotal: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Line subtotal (unit_price * quantity)",
    )

    discount_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Line discount amount",
    )

    tax_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Line tax amount",
    )

    line_total: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Line total net of discounts + taxes",
    )

    quotation: Mapped["Quotation"] = relationship(
        "Quotation",
        back_populates="lines",
    )

    __table_args__ = (
        CheckConstraint("quantity > 0", name="chk_quotation_item_qty_positive"),
        CheckConstraint("unit_price >= 0", name="chk_quotation_item_unit_price_non_negative"),
    )
