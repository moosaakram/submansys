"""
Sales Order and SalesOrderItem Models for SubMan / Brightloop 360.
Bridges approved Quotations to recurring Subscriptions and Invoices.
"""

import enum
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
import uuid
from sqlalchemy import (
    CheckConstraint,
    Date,
    Enum as SAEnum,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class SalesOrderStatus(str, enum.Enum):
    DRAFT = "draft"
    CONFIRMED = "confirmed"
    INVOICED = "invoiced"
    CANCELLED = "cancelled"


class SalesOrder(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Contractually binding sales order converted from an accepted quotation.
    """
    __tablename__ = "sales_orders"

    order_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
        comment="Sequential sales order identifier (e.g. SO-2026-0001)",
    )

    quotation_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("quotations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Originating quotation foreign key",
    )

    customer_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("customers.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Purchasing customer foreign key",
    )

    payment_term_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("payment_terms.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Payment terms foreign key",
    )

    status: Mapped[SalesOrderStatus] = mapped_column(
        SAEnum(SalesOrderStatus, name="sales_order_status", native_enum=False),
        nullable=False,
        default=SalesOrderStatus.CONFIRMED,
        index=True,
        comment="Order lifecycle: draft, confirmed, invoiced, cancelled",
    )

    order_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        default=date.today,
        comment="Official order booking date",
    )

    total_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Total order value in INR (₹)",
    )

    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Internal notes or fulfillment instructions",
    )

    lines: Mapped[List["SalesOrderItem"]] = relationship(
        "SalesOrderItem",
        back_populates="sales_order",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        CheckConstraint("total_amount >= 0", name="chk_sales_order_total_non_negative"),
    )


class SalesOrderItem(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Line item for a booked sales order, preserving product, variant, and pricing snapshots.
    """
    __tablename__ = "sales_order_items"

    sales_order_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("sales_orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Parent sales order foreign key",
    )

    product_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("products.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Catalog product foreign key",
    )

    variant_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("product_variants.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Selected variant foreign key",
    )

    product_name_snapshot: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Product title snapshot",
    )

    variant_name_snapshot: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Variant label snapshot",
    )

    sku_snapshot: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="SKU snapshot",
    )

    quantity: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=1,
        comment="Booked quantity",
    )

    unit_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        comment="Unit price snapshot",
    )

    line_subtotal: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Line subtotal (unit_price * quantity)",
    )

    discount_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Line discount amount",
    )

    tax_amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Line tax amount",
    )

    line_total: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Total net line amount in INR (₹)",
    )

    sales_order: Mapped["SalesOrder"] = relationship(
        "SalesOrder",
        back_populates="lines",
    )

    __table_args__ = (
        CheckConstraint("quantity > 0", name="chk_sales_order_item_qty_positive"),
        CheckConstraint("unit_price >= 0", name="chk_sales_order_item_unit_price_non_negative"),
    )
