"""
Subscription Plan Models for Brightloop 360.
Configured plan by plan: pricing, billing intervals, minimum quantity, validity, and lifecycle policies.
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
    Uuid,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from database.models.product import Product
    from database.models.quotation import QuotationTemplate
    from database.models.subscription import Subscription


class BillingCycle(str, enum.Enum):
    """
    Allowed recurring billing intervals for plans and subscriptions.
    """
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class Plan(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Represents a specific subscription tier/offering for a product.
    Governs billing cadence, availability window, and lifecycle behavior.
    """

    __tablename__ = "plans"

    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Associated product/service",
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Plan name (e.g., 'Starter Monthly', 'Enterprise Annual')",
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
        index=True,
        comment="Recurring billing cadence (daily, weekly, monthly, yearly)",
    )

    price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Base price per billing interval",
    )

    min_quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        comment="Minimum unit / seat quantity required for this plan",
    )

    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Plan availability start timestamp",
    )

    end_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Plan availability end timestamp (NULL if indefinitely available)",
    )

    # Lifecycle policies (decided plan by plan by admin)
    auto_close_on_end: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="Whether subscriptions under this plan close automatically when end_date is reached",
    )

    allow_early_close: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="Whether customers/staff can terminate the subscription before expiry",
    )

    allow_pause: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="Whether the subscription can be temporarily paused",
    )

    allow_renewal: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="Whether the subscription can be renewed upon conclusion",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="Whether this plan is currently active and available for new subscriptions",
    )

    # Relationships
    product: Mapped["Product"] = relationship(
        "Product",
        back_populates="plans",
    )

    subscriptions: Mapped[List["Subscription"]] = relationship(
        "Subscription",
        back_populates="plan",
        lazy="selectin",
    )

    quotation_templates: Mapped[List["QuotationTemplate"]] = relationship(
        "QuotationTemplate",
        back_populates="plan",
        lazy="selectin",
    )

    __table_args__ = (
        CheckConstraint("price >= 0", name="chk_plans_price_non_negative"),
        CheckConstraint("min_quantity > 0", name="chk_plans_min_quantity_positive"),
        CheckConstraint(
            "end_date IS NULL OR end_date >= start_date",
            name="chk_plans_end_date_after_start",
        ),
    )

    def __repr__(self) -> str:
        return (
            f"<Plan(id={self.id!r}, name={self.name!r}, cycle={self.billing_cycle!r}, "
            f"price={self.price!r}, active={self.is_active!r})>"
        )

