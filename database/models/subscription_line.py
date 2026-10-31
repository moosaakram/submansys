"""
Subscription Line Model for Brightloop 360.
Represents individual product items, add-ons, or variant lines attached to a subscription.
"""

import uuid
from decimal import Decimal
from typing import TYPE_CHECKING, Optional
from sqlalchemy import CheckConstraint, ForeignKey, Integer, Numeric, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from database.models.product import Product
    from database.models.product_variant import ProductVariant
    from database.models.subscription import Subscription
    from database.models.tax import TaxRule


class SubscriptionLine(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Detailed product line item within an active or draft subscription contract.
    """

    __tablename__ = "subscription_lines"

    subscription_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("subscriptions.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Parent subscription contract",
    )

    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Subscribed product item or software module",
    )

    variant_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("product_variants.id", ondelete="SET NULL"),
        nullable=True,
        comment="Optional chosen variant (e.g. brand modifier)",
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        comment="Seat / license / unit count",
    )

    unit_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Agreed price per unit before tax",
    )

    subtotal: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Line subtotal (quantity * unit_price)",
    )

    tax_rule_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("tax_rules.id", ondelete="SET NULL"),
        nullable=True,
        comment="Applied tax rule identifier",
    )

    tax_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Computed tax amount for this line item",
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Total amount including tax (subtotal + tax_amount)",
    )

    # Relationships
    subscription: Mapped["Subscription"] = relationship(
        "Subscription",
        back_populates="lines",
    )

    product: Mapped["Product"] = relationship(
        "Product",
        back_populates="subscription_lines",
    )

    variant: Mapped[Optional["ProductVariant"]] = relationship("ProductVariant")
    tax_rule: Mapped[Optional["TaxRule"]] = relationship("TaxRule")

    __table_args__ = (
        CheckConstraint("quantity > 0", name="chk_sub_line_qty_positive"),
        CheckConstraint("unit_price >= 0", name="chk_sub_line_unit_price_non_negative"),
        CheckConstraint("subtotal >= 0", name="chk_sub_line_subtotal_non_negative"),
        CheckConstraint("total_amount >= 0", name="chk_sub_line_total_non_negative"),
    )

    def calculate_totals(self) -> None:
        """Helper to recompute subtotal and tax amounts based on quantity, unit_price, and tax rule."""
        self.subtotal = self.unit_price * Decimal(self.quantity)
        if self.tax_rule and self.tax_rule.rate > 0:
            self.tax_amount = (self.subtotal * self.tax_rule.rate) / Decimal("100")
        else:
            self.tax_amount = Decimal("0.00")
        self.total_amount = self.subtotal + self.tax_amount

    def __repr__(self) -> str:
        return (
            f"<SubscriptionLine(id={self.id!r}, sub_id={self.subscription_id!r}, "
            f"product_id={self.product_id!r}, qty={self.quantity}, total={self.total_amount})>"
        )

