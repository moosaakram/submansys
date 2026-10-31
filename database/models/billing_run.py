"""
Billing Run and BillingRunItem Models for SubMan / Brightloop 360.
Logs automated and manual recurring billing batch executions, candidates, outcomes, and audit histories.
"""

import enum
from datetime import date, datetime
from decimal import Decimal
from typing import List, Optional
import uuid
from sqlalchemy import (
    CheckConstraint,
    Date,
    DateTime,
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


class BillingRunStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    PARTIAL_SUCCESS = "partial_success"


class BillingRunItemStatus(str, enum.Enum):
    SUCCESS = "success"
    ALREADY_PROCESSED = "already_processed"
    SKIPPED = "skipped"
    FAILED = "failed"


class BillingRun(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Header log record for a recurring billing engine execution batch.
    """
    __tablename__ = "billing_runs"

    run_number: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        unique=True,
        index=True,
        comment="Sequential batch run number (e.g. BRUN-2026-10-31-001)",
    )

    initiated_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        comment="Triggering user or NULL for scheduled cron",
    )

    status: Mapped[BillingRunStatus] = mapped_column(
        SAEnum(BillingRunStatus, name="billing_run_status", native_enum=False),
        nullable=False,
        default=BillingRunStatus.PENDING,
        comment="Run state: pending, processing, completed, failed, partial_success",
    )

    target_date: Mapped[date] = mapped_column(
        Date,
        nullable=False,
        default=date.today,
        comment="Target billing date evaluated",
    )

    total_candidates: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        comment="Total active subscriptions evaluated for billing",
    )

    successful_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        comment="Number of recurring invoices generated successfully",
    )

    skipped_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        comment="Number of subscriptions skipped (e.g. already billed or paused)",
    )

    failed_count: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
        default=0,
        comment="Number of candidate subscriptions that failed generation",
    )

    total_amount_billed: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Gross total amount billed in INR (₹)",
    )

    error_summary: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Summary of errors if any occurred",
    )

    items: Mapped[List["BillingRunItem"]] = relationship(
        "BillingRunItem",
        back_populates="billing_run",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    __table_args__ = (
        CheckConstraint("total_candidates >= 0", name="chk_billing_run_candidates_non_negative"),
        CheckConstraint("successful_count >= 0", name="chk_billing_run_success_non_negative"),
        CheckConstraint("skipped_count >= 0", name="chk_billing_run_skipped_non_negative"),
        CheckConstraint("failed_count >= 0", name="chk_billing_run_failed_non_negative"),
        CheckConstraint("total_amount_billed >= 0", name="chk_billing_run_amount_non_negative"),
    )


class BillingRunItem(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Per-subscription outcome item in a recurring billing run batch.
    """
    __tablename__ = "billing_run_items"

    billing_run_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("billing_runs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Parent billing run batch foreign key",
    )

    subscription_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("subscriptions.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Evaluated subscription foreign key",
    )

    subscription_number_snapshot: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        comment="Snapshot of subscription number",
    )

    invoice_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("invoices.id", ondelete="SET NULL"),
        nullable=True,
        comment="Generated invoice foreign key (if successful)",
    )

    status: Mapped[BillingRunItemStatus] = mapped_column(
        SAEnum(BillingRunItemStatus, name="billing_run_item_status", native_enum=False),
        nullable=False,
        comment="Item outcome: success, already_processed, skipped, failed",
    )

    amount: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Billed amount in INR (₹)",
    )

    error_message: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Detailed exception reason if processing failed",
    )

    billing_run: Mapped["BillingRun"] = relationship(
        "BillingRun",
        back_populates="items",
    )
