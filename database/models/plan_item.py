"""
Plan Item Model for SubMan / Brightloop 360.
Declares which catalogue products and variants are bundled into standard subscription plans.
"""

from decimal import Decimal
from typing import Optional
import uuid
from sqlalchemy import CheckConstraint, ForeignKey, Integer, Numeric, Uuid, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class PlanItem(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Bundles catalogue products/variants into a plan tier with allocated quantities and optional component pricing.
    """
    __tablename__ = "plan_items"

    plan_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("plans.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Associated plan foreign key",
    )

    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Included product foreign key",
    )

    variant_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("product_variants.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Specific product variant bundled (if applicable)",
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        comment="Included user quota / units bundled in plan",
    )

    unit_price: Mapped[Optional[Decimal]] = mapped_column(
        Numeric(12, 2),
        nullable=True,
        comment="Optional override price for this plan component",
    )

    __table_args__ = (
        CheckConstraint("quantity > 0", name="chk_plan_item_quantity_positive"),
        UniqueConstraint("plan_id", "product_id", "variant_id", name="uq_plan_product_variant"),
    )
