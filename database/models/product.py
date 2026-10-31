"""
Product Model for Brightloop 360 Subscription Management System.
"""

from decimal import Decimal
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import Boolean, CheckConstraint, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from database.models.subscription import Subscription


class Product(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Represents a purchasable plan, software service, or add-on product in Brightloop 360.
    """

    __tablename__ = "products"

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        comment="Display and catalog name of the product or plan",
    )

    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Detailed product description and features",
    )

    product_type: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        default="recurring",
        comment="Product classification (e.g., recurring, one_time, add_on)",
    )

    sales_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Standard selling price per billing cycle",
    )

    cost_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Internal unit cost price to deliver this product",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="Flag indicating if the product is active and available for subscription",
    )

    # Relationships
    subscriptions: Mapped[List["Subscription"]] = relationship(
        "Subscription",
        back_populates="product",
        lazy="selectin",
    )

    __table_args__ = (
        CheckConstraint("sales_price >= 0", name="chk_products_sales_price_positive"),
        CheckConstraint("cost_price >= 0", name="chk_products_cost_price_positive"),
    )

    def __repr__(self) -> str:
        return (
            f"<Product(id={self.id!r}, name={self.name!r}, "
            f"product_type={self.product_type!r}, sales_price={self.sales_price!r}, "
            f"is_active={self.is_active!r})>"
        )

