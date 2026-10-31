"""
Product Variant Models for Brightloop 360.
Supports product modifiers such as brand, tier, or hardware additions (e.g., Odoo brand adds +560).
"""

import uuid
from decimal import Decimal
from typing import TYPE_CHECKING
from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Numeric, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from database.models.product import Product


class ProductVariant(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Represents a specific variant of a product (e.g., brand, package, edition).
    Allows price adjustments on top of the base product price.
    """

    __tablename__ = "product_variants"

    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key referencing the parent product",
    )

    variant_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Display name of variant option (e.g., 'Brand: Odoo', 'Edition: Enterprise')",
    )

    sku: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
        comment="Stock Keeping Unit / distinct variant reference identifier",
    )

    price_extra: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Additional price added to base product sales price (e.g. +560.00 for Odoo brand)",
    )

    cost_extra: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Additional internal cost incurred for this variant",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="Whether this variant is available for selection",
    )

    # Relationships
    product: Mapped["Product"] = relationship(
        "Product",
        back_populates="variants",
    )

    __table_args__ = (
        CheckConstraint("price_extra >= 0", name="chk_variant_price_extra_non_negative"),
        CheckConstraint("cost_extra >= 0", name="chk_variant_cost_extra_non_negative"),
    )

    def __repr__(self) -> str:
        return (
            f"<ProductVariant(id={self.id!r}, product_id={self.product_id!r}, "
            f"name={self.variant_name!r}, price_extra=+{self.price_extra!r})>"
        )

