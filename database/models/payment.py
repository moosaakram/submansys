"""
Payment Model for Brightloop 360.
Records payments against invoices with method, date, transaction reference, and notes.
"""

import enum
import uuid
from datetime import datetime, timezone
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
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from database.models.invoice import Invoice


class PaymentMethod(str, enum.Enum):
    """
    Accepted payment methods.
    """
    CREDIT_CARD = "credit_card"
    BANK_TRANSFER = "bank_transfer"
    UPI = "upi"
    CASH = "cash"
    CHECK = "check"
    OTHER = "other"


class PaymentStatus(str, enum.Enum):
    """
    Transaction processing states.
    """
    SUCCESSFUL = "successful"
    PENDING = "pending"
    FAILED = "failed"
    REFUNDED = "refunded"


class Payment(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Represents an inbound payment settlement against a specific invoice.
    """

    __tablename__ = "payments"

    payment_number: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
        comment="Sequential fiscal payment receipt identifier (e.g. PAY-2026-0001)",
    )

    invoice_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("invoices.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Target invoice settled by this payment",
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        comment="Monetary amount received",
    )

    payment_method: Mapped[PaymentMethod] = mapped_column(
        SAEnum(
            PaymentMethod,
            name="payment_method_enum",
            native_enum=False,
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=False,
        default=PaymentMethod.BANK_TRANSFER,
        comment="Payment tender (credit_card, bank_transfer, upi, cash, check, other)",
    )

    payment_date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True,
        comment="Date and time when payment was received",
    )

    transaction_reference: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="External payment gateway ID, bank wire reference, or check number",
    )

    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Internal bookkeeping remarks or teller notes",
    )

    status: Mapped[PaymentStatus] = mapped_column(
        SAEnum(
            PaymentStatus,
            name="payment_status_enum",
            native_enum=False,
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=False,
        default=PaymentStatus.SUCCESSFUL,
        index=True,
        comment="Payment receipt status (successful, pending, failed, refunded)",
    )

    # Relationships
    invoice: Mapped["Invoice"] = relationship(
        "Invoice",
        back_populates="payments",
    )

    __table_args__ = (
        CheckConstraint("amount > 0", name="chk_payments_amount_positive"),
    )

    def __repr__(self) -> str:
        return (
            f"<Payment(id={self.id!r}, number={self.payment_number!r}, "
            f"invoice_id={self.invoice_id!r}, amount={self.amount}, status={self.status!r})>"
        )
