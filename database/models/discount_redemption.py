"""
Discount Product and Discount Redemption Models for SubMan / Brightloop 360.
Enforces product-scoped discount relationships and transactional usage redemption lifecycle.
"""

import enum
from decimal import Decimal
from typing import Optional
import uuid
from sqlalchemy import (
    CheckConstraint,
    Enum as SAEnum,
    ForeignKey,
    Numeric,
    UniqueConstraint,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class DiscountRedemptionStatus(str, enum.Enum):
    RESERVED = "reserved"
    CONSUMED = "consumed"
    RELEASED = "released"


class DiscountProduct(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Join table restricting a discount rule strictly to specific catalog products.
    """
    __tablename__ = "discount_products"

    discount_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("discount_rules.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Associated discount rule foreign key",
    )

    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Eligible product foreign key",
    )

    __table_args__ = (
        UniqueConstraint("discount_id", "product_id", name="uq_discount_product"),
    )


class DiscountRedemption(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Records usage of a discount rule against an invoice or quotation.
    Enforces atomic lifecycle: RESERVED -> CONSUMED (or RELEASED if transaction cancelled).
    """
    __tablename__ = "discount_redemptions"

    discount_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("discount_rules.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Redeemed discount rule foreign key",
    )

    customer_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("customers.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Customer claiming discount",
    )

    invoice_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("invoices.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
        comment="Target invoice where discount was applied",
    )

    quotation_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("quotations.id", ondelete="CASCADE"),
        nullable=True,
        index=True,
        comment="Target quotation where discount was applied",
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        comment="Discount deduction amount in INR (₹)",
    )

    status: Mapped[DiscountRedemptionStatus] = mapped_column(
        SAEnum(DiscountRedemptionStatus, name="discount_redemption_status", native_enum=False),
        nullable=False,
        default=DiscountRedemptionStatus.RESERVED,
        comment="Lifecycle: reserved, consumed, released",
    )

    __table_args__ = (
        CheckConstraint("amount >= 0", name="chk_redemption_amount_non_negative"),
    )
