"""
Subscription Model for Brightloop 360 Subscription Management System.
Tracks contract lifecycle, billing intervals, multi-item line configurations, and recurring status.
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
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from database.models.plan import BillingCycle

if TYPE_CHECKING:
    from database.models.customer import Customer
    from database.models.discount import SubscriptionDiscount
    from database.models.invoice import Invoice
    from database.models.plan import Plan
    from database.models.product import Product
    from database.models.quotation import QuotationTemplate
    from database.models.subscription_line import SubscriptionLine


class SubscriptionStatus(str, enum.Enum):
    """
    Subscription state machine lifecycle:
    Draft -> Quotation -> Confirmed -> Active -> Paused / Closed.
    """
    DRAFT = "draft"
    QUOTATION = "quotation"
    CONFIRMED = "confirmed"
    ACTIVE = "active"
    PAUSED = "paused"
    CLOSED = "closed"


class Subscription(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Represents an ongoing subscription contract for a customer.
    Tracks recurring billing intervals, pricing terms, lifecycle state, line items, and validity period.
    """

    __tablename__ = "subscriptions"

    customer_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key referencing the subscriber customer",
    )

    plan_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("plans.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
        comment="Associated subscription plan governing cycle and policies",
    )

    product_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
        comment="Primary subscribed product reference",
    )

    quotation_template_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("quotation_templates.id", ondelete="SET NULL"),
        nullable=True,
        comment="Quotation blueprint source if converted from quote",
    )

    subscription_number: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
        comment="Unique business reference number (e.g. SUB-2026-0001)",
    )

    billing_cycle: Mapped[BillingCycle] = mapped_column(
        SAEnum(
            BillingCycle,
            name="billing_cycle_enum",
            native_enum=False,
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=False,
        default=BillingCycle.MONTHLY,
        comment="Recurring billing frequency (daily, weekly, monthly, yearly)",
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        comment="Number of seats / units / licenses for this subscription",
    )

    unit_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Primary agreed price per unit per billing cycle",
    )

    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        comment="Subscription effective start timestamp",
    )

    expiry_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Subscription expiration or renewal cutoff timestamp (NULL if perpetual)",
    )

    next_billing_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
        comment="Scheduled date for automated invoice generation",
    )

    payment_terms: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="Net 30",
        comment="Payment terms (e.g., 'Immediate', 'Net 15', 'Net 30')",
    )

    status: Mapped[SubscriptionStatus] = mapped_column(
        SAEnum(
            SubscriptionStatus,
            name="subscription_status_enum",
            native_enum=False,
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=False,
        default=SubscriptionStatus.DRAFT,
        index=True,
        comment="Lifecycle status (draft, quotation, confirmed, active, paused, closed)",
    )

    # Financial rollups
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
        comment="Total active discounts applied",
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Total recurring charge amount per cycle",
    )

    # Relationships
    customer: Mapped["Customer"] = relationship(
        "Customer",
        back_populates="subscriptions",
    )

    plan: Mapped[Optional["Plan"]] = relationship(
        "Plan",
        back_populates="subscriptions",
    )

    product: Mapped[Optional["Product"]] = relationship(
        "Product",
        foreign_keys=[product_id],
    )

    quotation_template: Mapped[Optional["QuotationTemplate"]] = relationship("QuotationTemplate")

    lines: Mapped[List["SubscriptionLine"]] = relationship(
        "SubscriptionLine",
        back_populates="subscription",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    invoices: Mapped[List["Invoice"]] = relationship(
        "Invoice",
        back_populates="subscription",
        lazy="selectin",
    )

    applied_discounts: Mapped[List["SubscriptionDiscount"]] = relationship(
        "SubscriptionDiscount",
        back_populates="subscription",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        CheckConstraint("quantity > 0", name="chk_subscriptions_quantity_positive"),
        CheckConstraint("unit_price >= 0", name="chk_subscriptions_unit_price_non_negative"),
        CheckConstraint("subtotal >= 0", name="chk_subscriptions_subtotal_non_negative"),
        CheckConstraint("total_amount >= 0", name="chk_subscriptions_total_non_negative"),
        CheckConstraint(
            "expiry_date IS NULL OR expiry_date >= start_date",
            name="chk_subscriptions_expiry_after_start",
        ),
    )

    def recalculate_totals(self) -> None:
        """Recompute financial totals from attached subscription lines."""
        if self.lines:
            self.subtotal = sum((line.subtotal for line in self.lines), Decimal("0.00"))
            self.tax_amount = sum((line.tax_amount for line in self.lines), Decimal("0.00"))
            self.total_amount = max(Decimal("0.00"), self.subtotal + self.tax_amount - self.discount_amount)
        else:
            self.subtotal = self.unit_price * Decimal(self.quantity)
            self.total_amount = max(Decimal("0.00"), self.subtotal + self.tax_amount - self.discount_amount)

    def __repr__(self) -> str:
        return (
            f"<Subscription(id={self.id!r}, number={self.subscription_number!r}, "
            f"customer_id={self.customer_id!r}, cycle={self.billing_cycle!r}, status={self.status!r})>"
        )
