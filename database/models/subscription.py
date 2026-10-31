"""
Subscription and SubscriptionLine Models for Brightloop 360.
Implements the full lifecycle: Draft -> Quotation -> Confirmed -> Active -> Closed/Paused/Renewed.
"""

import enum
import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import (
    Boolean,
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

if TYPE_CHECKING:
    from database.models.customer import Customer
    from database.models.product import Product
    from database.models.plan import Plan


class BillingCycle(str, enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class SubscriptionStatus(str, enum.Enum):
    DRAFT = "draft"
    QUOTATION = "quotation"
    CONFIRMED = "confirmed"
    ACTIVE = "active"
    PAUSED = "paused"
    CLOSED = "closed"


class Subscription(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Represents an ongoing, quotation, or closed subscription contract.
    """
    __tablename__ = "subscriptions"

    subscription_number: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
        comment="Unique business reference number (e.g. SUB-2026-0001)",
    )

    customer_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Customer subscriber foreign key",
    )

    plan_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("plans.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Associated plan definition",
    )

    # Legacy/direct primary product reference (maintained for backward compatibility with Rishy's schema)
    product_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
        comment="Primary product reference",
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
        comment="Billing frequency: daily, weekly, monthly, yearly",
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        comment="Primary seat or package count",
    )

    unit_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Base unit price",
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Total recurring cycle amount across all lines",
    )

    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        comment="Subscription effective start timestamp",
    )

    expiry_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Subscription expiration timestamp",
    )

    payment_terms: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        default="Net 30",
        comment="Commercial payment terms (e.g. Due on Receipt, Net 15, Net 30)",
    )

    payment_method: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        default="credit_card",
        comment="Preferred payment method (credit_card, bank_transfer, etc.)",
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
        comment="Lifecycle status: draft, quotation, confirmed, active, paused, closed",
    )

    # Billing Day tracking to ensure nothing is billed twice or skipped
    last_billed_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Timestamp when subscription was most recently billed",
    )

    next_billing_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        index=True,
        comment="Upcoming timestamp when next invoice should be generated",
    )

    # Lifecycle constraint overrides copied from plan (or customized)
    auto_close: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Auto-closes upon expiry_date",
    )

    allow_early_close: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    allow_pause: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    allow_renew: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Commercial or internal notes",
    )

    # Relationships
    customer: Mapped["Customer"] = relationship(
        "Customer",
        back_populates="subscriptions",
    )

    product: Mapped[Optional["Product"]] = relationship(
        "Product",
        back_populates="subscriptions",
    )

    plan: Mapped[Optional["Plan"]] = relationship("Plan")

    lines: Mapped[List["SubscriptionLine"]] = relationship(
        "SubscriptionLine",
        back_populates="subscription",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        CheckConstraint("quantity > 0", name="chk_subscriptions_quantity_positive"),
        CheckConstraint("unit_price >= 0", name="chk_subscriptions_unit_price_non_negative"),
        CheckConstraint("total_amount >= 0", name="chk_subscriptions_total_amount_non_negative"),
    )

    def __repr__(self) -> str:
        return (
            f"<Subscription(id={self.id!r}, number={self.subscription_number!r}, "
            f"customer_id={self.customer_id!r}, status={self.status.value!r})>"
        )


class SubscriptionLine(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Individual product, variant, and seat lines within a subscription.
    """
    __tablename__ = "subscription_lines"

    subscription_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("subscriptions.id", ondelete="CASCADE"),
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

    product_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
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

    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        default=Decimal("0.00"),
        nullable=False,
    )

    subscription: Mapped["Subscription"] = relationship(
        "Subscription",
        back_populates="lines",
    )
