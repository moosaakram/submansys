"""
Invoice and InvoiceLine Models for Brightloop 360.
Implements the invoice lifecycle: Draft -> Confirmed -> Paid (with cancel, send, print).
"""

import enum
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import (
    CheckConstraint,
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
    PAID = "paid"
    CANCELLED = "cancelled"


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
        comment="Status: draft, confirmed, paid, cancelled",
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
        CheckConstraint("total_amount >= 0", name="chk_invoices_total_non_negative"),
        CheckConstraint("paid_amount >= 0", name="chk_invoices_paid_non_negative"),
    )

    @property
    def is_overdue(self) -> bool:
        """Calculates whether invoice is overdue based on due date and unpaid balance."""
        if self.status in (InvoiceStatus.PAID, InvoiceStatus.CANCELLED):
            return False
        due_tz = self.due_date.replace(tzinfo=timezone.utc) if self.due_date.tzinfo is None else self.due_date
        now = datetime.now(timezone.utc)
        return now > due_tz and self.outstanding_amount > Decimal("0.00")

    @property
    def outstanding_amount(self) -> Decimal:
        """Returns unpaid remaining balance."""
        return max(Decimal("0.00"), self.total_amount - self.paid_amount)


class InvoiceLine(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Itemized product lines on an invoice.
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
    )

    variant_name: Mapped[Optional[str]] = mapped_column(
        String(100),
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

    tax_rate: Mapped[Decimal] = mapped_column(
        Numeric(6, 3),
        default=Decimal("0.000"),
        nullable=False,
    )

    tax_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=Decimal("0.00"),
        nullable=False,
    )

    discount_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=Decimal("0.00"),
        nullable=False,
    )

    line_total: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=Decimal("0.00"),
        nullable=False,
    )

    invoice: Mapped["Invoice"] = relationship(
        "Invoice",
        back_populates="lines",
    )


# Late import to satisfy type check
from database.models.payment import Payment
