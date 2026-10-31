"""
Subscription Model for Brightloop 360 Subscription Management System.
"""

import enum
import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional

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

if TYPE_CHECKING:
    from database.models.customer import Customer
    from database.models.product import Product


class BillingCycle(str, enum.Enum):
    """
    Allowed billing cycles for recurring subscriptions.
    """
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class SubscriptionStatus(str, enum.Enum):
    """
    Lifecycle statuses for subscriptions.
    """
    DRAFT = "draft"
    QUOTATION = "quotation"
    CONFIRMED = "confirmed"
    ACTIVE = "active"
    CLOSED = "closed"


class Subscription(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Represents an ongoing or closed subscription contract between a customer and a product.
    Tracks recurring billing intervals, pricing terms, lifecycle state, and validity period.
    """

    __tablename__ = "subscriptions"

    customer_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("customers.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key referencing the subscriber customer",
    )

    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Foreign key referencing the subscribed product",
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
        comment="Agreed price per unit per billing cycle",
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
        comment="Lifecycle status (draft, quotation, confirmed, active, closed)",
    )

    # Relationships
    customer: Mapped["Customer"] = relationship(
        "Customer",
        back_populates="subscriptions",
    )

    product: Mapped["Product"] = relationship(
        "Product",
        back_populates="subscriptions",
    )

    __table_args__ = (
        CheckConstraint("quantity > 0", name="chk_subscriptions_quantity_positive"),
        CheckConstraint("unit_price >= 0", name="chk_subscriptions_unit_price_non_negative"),
        CheckConstraint(
            "expiry_date IS NULL OR expiry_date >= start_date",
            name="chk_subscriptions_expiry_after_start",
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<Subscription(id={self.id!r}, number={self.subscription_number!r}, "
            f"customer_id={self.customer_id!r}, product_id={self.product_id!r}, "
            f"cycle={self.billing_cycle!r}, status={self.status!r})>"
        )
