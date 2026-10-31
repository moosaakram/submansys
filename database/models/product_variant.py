"""
Product Variant Model for Brightloop 360.
Supports variants with price modifications (e.g. Odoo brand adds +560).
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
    Represents a specific variant of a catalog product.
    """
    __tablename__ = "product_variants"

    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Parent product foreign key",
    )

    attribute_name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Attribute type (e.g., Brand, Edition, Tier)",
    )

    attribute_value: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        comment="Attribute value (e.g., Odoo, Enterprise, Pro)",
    )

    price_extra: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Additional delta price added to base product sales price",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # Relationship
    product: Mapped["Product"] = relationship("Product", backref="variants")

    __table_args__ = (
        CheckConstraint("price_extra >= 0", name="chk_variant_price_extra_non_negative"),
    )

    def __repr__(self) -> str:
        return f"<ProductVariant(id={self.id!r}, name={self.attribute_name}:{self.attribute_value}, extra={self.price_extra})>"
