"""
Subscription Event Model for SubMan / Brightloop 360.
Append-only audit trail capturing lifecycle transitions, pauses, resumes, and automated renewals.
"""

from typing import Optional, Any, Dict
import uuid
from sqlalchemy import ForeignKey, String, Text, Uuid, JSON
from sqlalchemy.orm import Mapped, mapped_column

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class SubscriptionEvent(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Append-only lifecycle event log for subscriptions.
    Guarantees immutable historical audit trail for financial & compliance inspection.
    """
    __tablename__ = "subscription_events"

    subscription_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("subscriptions.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
        comment="Associated subscription foreign key",
    )

    actor_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Triggering user profile (NULL indicates system/cron automated routine)",
    )

    event_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
        comment="CREATED, ACTIVATED, PAUSED, RESUMED, RENEWED, CANCELLED, CLOSED, EXPIRED, PLAN_CHANGED",
    )

    from_status: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Previous subscription status",
    )

    to_status: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="New subscription status",
    )

    reason: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Reason or business justification for lifecycle change",
    )

    event_metadata: Mapped[Optional[Dict[str, Any]]] = mapped_column(
        JSON,
        nullable=True,
        comment="Additional structured parameters (e.g. extension months, prior plan)",
    )
