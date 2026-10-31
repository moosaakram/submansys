"""
Payment Model for Brightloop 360.
Records payments with payment method, amount, date, and notes mapped to invoices.
Supports append-only transaction history, reversals, and refunds.
"""

import enum
import uuid
from datetime import datetime
from decimal import Decimal
from typing import TYPE_CHECKING, Optional
from sqlalchemy import (
    CheckConstraint,
    DateTime,
    Enum as SAEnum,
    ForeignKey,
    Numeric,
    String,
    Text,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from database.models.invoice import Invoice


class PaymentType(str, enum.Enum):
    PAYMENT = "payment"
    REFUND = "refund"
    REVERSAL = "reversal"


class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    SUCCESS = "success"
    FAILED = "failed"
    REFUNDED = "refunded"


class Payment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Financial payment transaction receipt recorded against a specific invoice.
    """
    __tablename__ = "payments"

    payment_number: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
        comment="Unique payment reference number (e.g. PAY-2026-0001)",
    )

    invoice_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("invoices.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Target invoice reference",
    )

    customer_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("customers.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Direct customer association",
    )

    payment_method: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="credit_card",
        comment="UPI, bank_transfer, cash, card, cheque, other",
    )

    payment_type: Mapped[PaymentType] = mapped_column(
        SAEnum(PaymentType, name="payment_type_enum", native_enum=False),
        nullable=False,
        default=PaymentType.PAYMENT,
        comment="payment, refund, reversal",
    )

    reversed_payment_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("payments.id", ondelete="RESTRICT"),
        nullable=True,
        comment="Original payment transaction ID if this is a reversal or refund",
    )

    status: Mapped[PaymentStatus] = mapped_column(
        SAEnum(PaymentStatus, name="payment_status_enum", native_enum=False),
        nullable=False,
        default=PaymentStatus.SUCCESS,
        comment="pending, success, failed, refunded",
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        comment="Payment transaction amount collected in INR (₹)",
    )

    payment_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        comment="Date and time when payment was received",
    )

    reference_number: Mapped[Optional[str]] = mapped_column(
        String(150),
        nullable=True,
        comment="External bank transfer or gateway transaction reference",
    )

    note: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Internal notes regarding payment reconciliation",
    )

    invoice: Mapped["Invoice"] = relationship(
        "Invoice",
        back_populates="payments",
    )

    __table_args__ = (
        CheckConstraint("amount > 0", name="chk_payments_amount_positive"),
    )

    def __repr__(self) -> str:
        return f"<Payment(id={self.id!r}, number={self.payment_number!r}, amount={self.amount!r}, method={self.payment_method!r})>"
