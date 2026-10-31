"""
Plan Model for Brightloop 360.
Configures billing frequency, minimum quantity, availability dates, and lifecycle policies.
"""

import enum
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy import Boolean, CheckConstraint, DateTime, Enum as SAEnum, ForeignKey, Integer, Numeric, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class PlanBillingCycle(str, enum.Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


# Alias for backward compatibility
BillingCycle = PlanBillingCycle


class Plan(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Defines subscription terms, recurrence cadence, pricing, and lifecycle constraints.
    """
    __tablename__ = "plans"

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        comment="Plan display title (e.g. Starter Monthly, Enterprise Annual)",
    )

    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Plan description and features included",
    )

    product_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Optional default primary product linked to this plan",
    )

    cost: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Base cost for this plan per billing cycle",
    )

    billing_cycle: Mapped[PlanBillingCycle] = mapped_column(
        SAEnum(
            PlanBillingCycle,
            name="plan_billing_cycle_enum",
            native_enum=False,
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=False,
        default=PlanBillingCycle.MONTHLY,
        comment="Billing frequency: daily, weekly, monthly, yearly",
    )

    minimum_quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        comment="Minimum seats/quantity required to purchase this plan",
    )

    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        comment="Date plan becomes available",
    )

    end_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Date plan availability expires (NULL if ongoing)",
    )

    # Lifecycle Policies
    auto_close: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Plan automatically closes when end_date / period finishes",
    )

    allow_early_close: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Whether customer or staff can terminate before expiration",
    )

    allow_pause: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Whether subscription can be temporarily paused and resumed",
    )

    allow_renew: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Whether subscription can be renewed",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Plan active status",
    )

    __table_args__ = (
        CheckConstraint("cost >= 0", name="chk_plans_cost_positive"),
        CheckConstraint("minimum_quantity >= 1", name="chk_plans_min_qty_positive"),
    )

    @property
    def price(self) -> Decimal:
        return self.cost

    @price.setter
    def price(self, val: Decimal) -> None:
        self.cost = val

    @property
    def min_quantity(self) -> int:
        return self.minimum_quantity

    @min_quantity.setter
    def min_quantity(self, val: int) -> None:
        self.minimum_quantity = val

    @property
    def auto_close_on_end(self) -> bool:
        return self.auto_close

    @auto_close_on_end.setter
    def auto_close_on_end(self, val: bool) -> None:
        self.auto_close = val

    @property
    def allow_renewal(self) -> bool:
        return self.allow_renew

    @allow_renewal.setter
    def allow_renewal(self, val: bool) -> None:
        self.allow_renew = val

    def __repr__(self) -> str:
        return f"<Plan(id={self.id!r}, name={self.name!r}, cycle={self.billing_cycle.value!r}, cost={self.cost!r})>"
