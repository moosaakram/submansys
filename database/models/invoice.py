"""
Invoice and Invoice Line Models for Brightloop 360.
Automated billing records with tax calculations, status progression, and double-billing prevention.
"""

import enum
import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from database.models.customer import Customer
    from database.models.payment import Payment
    from database.models.product import Product
    from database.models.product_variant import ProductVariant
    from database.models.subscription import Subscription
    from database.models.tax import TaxRule


class InvoiceStatus(str, enum.Enum):
    """
    Lifecycle progression of an invoice:
    Draft -> Confirmed -> Paid (or Cancelled).
    """
    DRAFT = "draft"
    CONFIRMED = "confirmed"
    PAID = "paid"
    CANCELLED = "cancelled"


class Invoice(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Billing invoice generated automatically from due subscriptions or issued manually.
    Includes database-level invariants guaranteeing no period is billed twice.
    """

    __tablename__ = "invoices"

    invoice_number: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
        comment="Sequential fiscal invoice number (e.g. INV-2026-0001)",
    )

    customer_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("customers.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Billed customer recipient",
    )

    subscription_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("subscriptions.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Originating subscription contract (NULL for ad-hoc standalone invoices)",
    )

    issue_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        comment="Invoice issue date",
    )

    due_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
        comment="Payment due date (used to identify overdue invoices)",
    )

    billing_period_start: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Service coverage period start date",
    )

    billing_period_end: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Service coverage period end date",
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
        comment="Lifecycle status (draft, confirmed, paid, cancelled)",
    )

    subtotal: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Subtotal before taxes and discounts",
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
        comment="Total discounts deducted from this invoice",
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Total grand amount payable",
    )

    amount_paid: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Cumulative amount paid towards this invoice",
    )

    amount_due: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Remaining balance due (total_amount - amount_paid)",
    )

    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Public customer notes or payment instructions",
    )

    # Relationships
    customer: Mapped["Customer"] = relationship(
        "Customer",
        back_populates="invoices",
    )

    subscription: Mapped[Optional["Subscription"]] = relationship(
        "Subscription",
        back_populates="invoices",
    )

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
        CheckConstraint("subtotal >= 0", name="chk_invoices_subtotal_non_negative"),
        CheckConstraint("total_amount >= 0", name="chk_invoices_total_non_negative"),
        CheckConstraint("amount_paid >= 0", name="chk_invoices_amount_paid_non_negative"),
        CheckConstraint("amount_due >= 0", name="chk_invoices_amount_due_non_negative"),
        # Core Invariant: Zero double billing for the same subscription window
        UniqueConstraint(
            "subscription_id",
            "billing_period_start",
            "billing_period_end",
            name="uq_invoice_subscription_billing_period",
        ),
    )

    def recalculate_totals(self) -> None:
        """Computes subtotal, tax_amount, total_amount, and remaining amount_due."""
        if self.lines:
            self.subtotal = sum((line.subtotal for line in self.lines), Decimal("0.00"))
            self.tax_amount = sum((line.tax_amount for line in self.lines), Decimal("0.00"))
        self.total_amount = max(Decimal("0.00"), self.subtotal + self.tax_amount - self.discount_amount)
        self.amount_due = max(Decimal("0.00"), self.total_amount - self.amount_paid)

    def record_payment(self, payment_amount: Decimal) -> None:
        """Registers a payment, adjusts balances, and advances status to PAID when settled."""
        self.amount_paid += payment_amount
        self.amount_due = max(Decimal("0.00"), self.total_amount - self.amount_paid)
        if self.amount_due == Decimal("0.00") and self.total_amount > Decimal("0.00"):
            self.status = InvoiceStatus.PAID

    def __repr__(self) -> str:
        return (
            f"<Invoice(id={self.id!r}, number={self.invoice_number!r}, "
            f"customer_id={self.customer_id!r}, total={self.total_amount}, status={self.status!r})>"
        )


class InvoiceLine(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Itemized product charge line on an invoice.
    """

    __tablename__ = "invoice_lines"

    invoice_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("invoices.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Parent invoice",
    )

    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Billed product item",
    )

    variant_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("product_variants.id", ondelete="SET NULL"),
        nullable=True,
        comment="Optional billed product variant",
    )

    description: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Line item description on printed invoice",
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        comment="Billed units / seats",
    )

    unit_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Price per unit",
    )

    subtotal: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Line subtotal before tax (quantity * unit_price)",
    )

    tax_rule_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("tax_rules.id", ondelete="SET NULL"),
        nullable=True,
        comment="Tax rule applied to this line",
    )

    tax_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Calculated tax for this line item",
    )

    line_total: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Final line total including tax (subtotal + tax_amount)",
    )

    # Relationships
    invoice: Mapped["Invoice"] = relationship(
        "Invoice",
        back_populates="lines",
    )

    product: Mapped["Product"] = relationship("Product")
    variant: Mapped[Optional["ProductVariant"]] = relationship("ProductVariant")
    tax_rule: Mapped[Optional["TaxRule"]] = relationship("TaxRule")

    __table_args__ = (
        CheckConstraint("quantity > 0", name="chk_invoice_line_qty_positive"),
        CheckConstraint("unit_price >= 0", name="chk_invoice_line_unit_price_non_negative"),
        CheckConstraint("subtotal >= 0", name="chk_invoice_line_subtotal_non_negative"),
        CheckConstraint("line_total >= 0", name="chk_invoice_line_total_non_negative"),
    )

    def calculate_totals(self) -> None:
        """Computes subtotal and tax_amount for this line item."""
        self.subtotal = self.unit_price * Decimal(self.quantity)
        if self.tax_rule and self.tax_rule.rate > 0:
            self.tax_amount = (self.subtotal * self.tax_rule.rate) / Decimal("100")
        else:
            self.tax_amount = Decimal("0.00")
        self.line_total = self.subtotal + self.tax_amount

    def __repr__(self) -> str:
        return (
            f"<InvoiceLine(id={self.id!r}, invoice_id={self.invoice_id!r}, "
            f"desc={self.description!r}, total={self.line_total})>"
        )

