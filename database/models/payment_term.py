"""
Payment Terms Model for SubMan / Brightloop 360.
Configures due periods (Net 0, Net 15, Net 30, Due on Receipt) used across quotations, orders, and invoices.
"""

from typing import Optional
from sqlalchemy import Boolean, CheckConstraint, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class PaymentTerm(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Standard credit / payment due terms templates.
    """
    __tablename__ = "payment_terms"

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
        comment="Term name (e.g., Net 30, Due on Receipt, Net 15)",
    )

    days_due: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=30,
        comment="Number of calendar days until invoice is overdue",
    )

    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Internal notes or customer-facing payment policy",
    )

    is_default: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
        comment="Whether this is the system default payment term",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Active flag",
    )

    __table_args__ = (
        CheckConstraint("days_due >= 0", name="chk_payment_terms_days_due_non_negative"),
    )
