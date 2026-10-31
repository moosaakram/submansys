"""
Invoice and InvoiceLine Models for Brightloop 360.
Implements the invoice lifecycle: Draft -> Confirmed -> Partially Paid -> Paid (with cancel, send, print).
"""

import enum
import uuid
from datetime import date, datetime, timezone
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
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


class InvoiceStatus(str, enum.Enum):
    DRAFT = "draft"
    CONFIRMED = "confirmed"
    PARTIALLY_PAID = "partially_paid"
    PAID = "paid"
    CANCELLED = "cancelled"


class InvoiceKind(str, enum.Enum):
    STANDARD = "standard"
    RECURRING = "recurring"
    ONE_TIME = "one_time"


class Invoice(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Generated from subscriptions on billing day or created manually.
    Tracks lines, taxes, automated discounts, and payment status.
    """
    __tablename__ = "invoices"

    invoice_number: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
        comment="Unique invoice reference number (e.g. INV-2026-0001)",
    )

    subscription_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("subscriptions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Source subscription if generated automatically on billing day",
    )

    customer_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("customers.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    customer_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    customer_email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    invoice_kind: Mapped[InvoiceKind] = mapped_column(
        SAEnum(
            InvoiceKind,
            name="invoice_kind_enum",
            native_enum=False,
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=False,
        default=InvoiceKind.STANDARD,
        index=True,
        comment="STANDARD, RECURRING, ONE_TIME",
    )

    issue_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        comment="Invoice billing issue date",
    )

    due_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
        comment="Payment due date",
    )

    billing_period_start: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
        comment="Recurring service cycle start boundary",
    )

    billing_period_end: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
        comment="Recurring service cycle end boundary",
    )

    currency: Mapped[str] = mapped_column(
        String(3),
        nullable=False,
        default="INR",
        comment="Currency standard (INR)",
    )

    status: Mapped[InvoiceStatus] = mapped_column(
        SAEnum(
            InvoiceStatus,
            name="invoice_status_enum",
            native_enum=False,
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=False,
        default=InvoiceStatus.DRAFT,
        index=True,
        comment="Status: draft, confirmed, partially_paid, paid, cancelled",
    )

    subtotal: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Gross sum of line items before discounts & taxes",
    )

    tax_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Total calculated taxes",
    )

    discount_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Total auto-applied or manual discounts",
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Net final amount payable (subtotal - discount + tax)",
    )

    paid_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Total payments collected against this invoice",
    )

    balance: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Remaining unpaid balance (total_amount - paid_amount)",
    )

    replaces_invoice_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("invoices.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Replacement link if reissued following cancellation",
    )

    cancellation_reason: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Commercial or audit reason for cancellation",
    )

    sent_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Timestamp when invoice was dispatched to customer",
    )

    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    # Relationships
    lines: Mapped[List["InvoiceLine"]] = relationship(
        "InvoiceLine",
        back_populates="invoice",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    payments: Mapped[List["Payment"]] = relationship(
        "Payment",
        back_populates="invoice",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        CheckConstraint("total_amount >= 0", name="chk_invoice_total_non_negative"),
        CheckConstraint("paid_amount >= 0", name="chk_invoice_paid_non_negative"),
        CheckConstraint("paid_amount <= total_amount", name="chk_invoice_paid_not_exceed_total"),
        CheckConstraint("subtotal >= 0", name="chk_invoice_subtotal_non_negative"),
    )


class InvoiceLine(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Snapshot of product line details at the moment of invoice generation.
    """
    __tablename__ = "invoice_lines"

    invoice_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("invoices.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    product_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
    )

    product_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Snapshot product title",
    )

    variant_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Snapshot product variant title",
    )

    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
    )

    unit_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    tax_rate: Mapped[Decimal] = mapped_column(
        Numeric(6, 3),
        nullable=False,
        default=Decimal("0.000"),
    )

    tax_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
    )

    discount_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
    )

    line_total: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
    )

    def __init__(self, **kwargs):
        if "total" in kwargs and "line_total" not in kwargs:
            kwargs["line_total"] = kwargs.pop("total")
        super().__init__(**kwargs)

    @property
    def total(self) -> Decimal:
        return self.line_total

    @total.setter
    def total(self, value: Decimal) -> None:
        self.line_total = value

    invoice: Mapped["Invoice"] = relationship(
        "Invoice",
        back_populates="lines",
    )

    __table_args__ = (
        CheckConstraint("quantity > 0", name="chk_line_quantity_positive"),
        CheckConstraint("unit_price >= 0", name="chk_line_unit_price_non_negative"),
        CheckConstraint("line_total >= 0", name="chk_line_total_non_negative"),
    )
