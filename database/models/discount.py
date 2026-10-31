"""
Discount and Coupon Models for Brightloop 360.
Configured by administrators for automated promotional pricing, minimum purchase gates, and usage caps.
"""

import enum
import uuid
from datetime import datetime, timezone
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
    from database.models.subscription import Subscription


class DiscountType(str, enum.Enum):
    """
    Format of discount reduction.
    """
    PERCENTAGE = "percentage"
    FIXED_AMOUNT = "fixed_amount"


class DiscountScope(str, enum.Enum):
    """
    Scope to which the discount applies: specific product item or the entire subscription.
    """
    WHOLE_SUBSCRIPTION = "whole_subscription"
    SPECIFIC_PRODUCT = "specific_product"


class DiscountRule(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Admin-managed discount rules with date ranges, minimum spend/seat quantities, and lifetime usage limits.
    """

    __tablename__ = "discount_rules"

    code: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
        comment="Promotional discount promo code (e.g., 'SAVE20', 'ENTERPRISE100')",
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Descriptive name of promotion",
    )

    discount_type: Mapped[DiscountType] = mapped_column(
        SAEnum(
            DiscountType,
            name="discount_type_enum",
            native_enum=False,
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=False,
        default=DiscountType.PERCENTAGE,
        comment="Percentage or fixed currency amount reduction",
    )

    value: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        comment="Discount magnitude (e.g. 15.00 for 15% or $15.00 flat)",
    )

    applies_to: Mapped[DiscountScope] = mapped_column(
        SAEnum(
            DiscountScope,
            name="discount_scope_enum",
            native_enum=False,
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=False,
        default=DiscountScope.WHOLE_SUBSCRIPTION,
        comment="Application target (whole subscription or specific product)",
    )

    product_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Required if applies_to is SPECIFIC_PRODUCT",
    )

    min_purchase_amount: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(12, 2),
        nullable=True,
        comment="Minimum transaction value required before discount activates",
    )

    min_quantity: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Minimum seat or license quantity required to qualify",
    )

    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Discount campaign start date",
    )

    end_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Discount campaign expiration cutoff (NULL if perpetual)",
    )

    max_usage_limit: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Maximum number of times this coupon can be redeemed across the system (NULL = unlimited)",
    )

    current_usage_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        comment="Running count of how many times this rule has been applied to invoices",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="Administrative killswitch for this discount rule",
    )

    # Relationships
    product: Mapped[Optional["Product"]] = relationship("Product")
    applied_subscriptions: Mapped[List["SubscriptionDiscount"]] = relationship(
        "SubscriptionDiscount",
        back_populates="discount_rule",
        lazy="selectin",
    )

    __table_args__ = (
        CheckConstraint("value > 0", name="chk_discount_value_positive"),
        CheckConstraint(
            "end_date IS NULL OR end_date >= start_date",
            name="chk_discount_end_date_after_start",
        ),
    )

    def is_valid_now(
        self,
        purchase_amount: Decimal = Decimal("0.00"),
        quantity: int = 1,
        check_time: Optional[datetime] = None,
    ) -> bool:
        """Determines whether this discount rule is eligible for application given current time and cart values."""
        if not self.is_active:
            return False

        now = check_time or datetime.now(timezone.utc)
        if now.tzinfo is None:
            now = now.replace(tzinfo=timezone.utc)

        if self.start_date:
            start = self.start_date if self.start_date.tzinfo else self.start_date.replace(tzinfo=timezone.utc)
            if now < start:
                return False
        if self.end_date:
            end = self.end_date if self.end_date.tzinfo else self.end_date.replace(tzinfo=timezone.utc)
            if now > end:
                return False
        if self.max_usage_limit is not None and self.current_usage_count >= self.max_usage_limit:
            return False
        if self.min_purchase_amount is not None and purchase_amount < self.min_purchase_amount:
            return False
        if self.min_quantity is not None and quantity < self.min_quantity:
            return False

        return True

    def __repr__(self) -> str:
        return (
            f"<DiscountRule(id={self.id!r}, code={self.code!r}, type={self.discount_type!r}, "
            f"value={self.value}, active={self.is_active!r})>"
        )


class SubscriptionDiscount(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Association tracking discounts currently assigned to recurring subscriptions.
    """

    __tablename__ = "subscription_discounts"

    subscription_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("subscriptions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Target subscription contract",
    )

    discount_rule_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("discount_rules.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Associated discount rule",
    )

    applied_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Timestamp when discount was attached to the subscription",
    )

    # Relationships
    subscription: Mapped["Subscription"] = relationship(
        "Subscription",
        back_populates="applied_discounts",
    )

    discount_rule: Mapped["DiscountRule"] = relationship(
        "DiscountRule",
        back_populates="applied_subscriptions",
    )

    def __repr__(self) -> str:
        return (
            f"<SubscriptionDiscount(subscription_id={self.subscription_id!r}, "
            f"discount_rule_id={self.discount_rule_id!r})>"
        )
