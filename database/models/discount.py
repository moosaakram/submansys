"""
Discount Rules Model for Brightloop 360.
Supports admin-defined fixed or percentage discounts with minimum thresholds, limits, and auto-application.
"""

import enum
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional
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
)
from sqlalchemy.orm import Mapped, mapped_column

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class DiscountType(str, enum.Enum):
    FIXED_AMOUNT = "fixed_amount"
    PERCENTAGE = "percentage"


class DiscountScope(str, enum.Enum):
    WHOLE_SUBSCRIPTION = "whole_subscription"
    PRODUCT = "product"


class DiscountRule(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Discount rules created strictly by Admin.
    Automatically applies to qualifying subscriptions and invoices until expired or max_uses reached.
    """
    __tablename__ = "discount_rules"

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        comment="Human-readable title (e.g. Volume Seat Discount, Summer Promo)",
    )

    code: Mapped[Optional[str]] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=True,
        comment="Optional coupon/promo code (e.g., VOLUME10)",
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
        comment="Calculation type: fixed dollar amount or percentage deduction",
    )

    value: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        comment="Discount numerical value (e.g. 15.00 for 15% or 50.00 for $50 off)",
    )

    min_purchase_amount: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(12, 2),
        nullable=True,
        comment="Minimum total spend required before rule applies",
    )

    min_quantity: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Minimum quantity/seats required (e.g. discount for taking > 10 seats)",
    )

    start_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        comment="Date the discount becomes active",
    )

    end_date: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Date the discount ceases to be valid (NULL if perpetual)",
    )

    max_uses: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
        comment="Maximum total redemptions allowed across the system",
    )

    current_uses: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
        comment="Total times this discount has been applied",
    )

    scope: Mapped[DiscountScope] = mapped_column(
        SAEnum(
            DiscountScope,
            name="discount_scope_enum",
            native_enum=False,
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=False,
        default=DiscountScope.WHOLE_SUBSCRIPTION,
        comment="Whether the discount applies to a specific product or whole subscription",
    )

    product_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="SET NULL"),
        nullable=True,
        comment="Target product if scope is product",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Admin toggle to activate or deactivate rule",
    )

    __table_args__ = (
        CheckConstraint("value >= 0", name="chk_discounts_value_positive"),
        CheckConstraint("current_uses >= 0", name="chk_discounts_current_uses_positive"),
    )

    def is_eligible(self, subtotal: Decimal, quantity: int, current_dt: Optional[datetime] = None) -> bool:
        """Determines if this discount rule can be applied based on dates, limits, and minimums."""
        if not self.is_active:
            return False
        
        now = current_dt or datetime.now(timezone.utc)
        if now.tzinfo is None:
            now = now.replace(tzinfo=timezone.utc)
        start = self.start_date.replace(tzinfo=timezone.utc) if self.start_date.tzinfo is None else self.start_date
        end = self.end_date.replace(tzinfo=timezone.utc) if self.end_date and self.end_date.tzinfo is None else self.end_date
        
        if now < start:
            return False
        if end and now > end:
            return False
        if self.max_uses is not None and self.current_uses >= self.max_uses:
            return False
        if self.min_purchase_amount is not None and subtotal < self.min_purchase_amount:
            return False
        if self.min_quantity is not None and quantity < self.min_quantity:
            return False

        return True

    def calculate_discount(self, base_amount: Decimal) -> Decimal:
        """Calculates discount reduction amount for a given base amount."""
        if self.discount_type == DiscountType.PERCENTAGE:
            discount = (base_amount * self.value) / Decimal("100.00")
        else:
            discount = self.value
        return min(discount, base_amount)
