"""
Database declarative base and common model mixins for Brightloop 360.
Provides the SQLAlchemy Base class and reusable columns (UUID primary keys, timestamps).
"""

import uuid
from datetime import datetime
from sqlalchemy import DateTime, Uuid, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    """
    Base class for all SQLAlchemy ORM models in Brightloop 360.
    """
    pass


class TimestampMixin:
    """
    Mixin that provides created_at and updated_at timezone-aware timestamps.
    Automatically managed by database server default / SQLAlchemy onupdate.
    """

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        comment="Timestamp when record was created",
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
        comment="Timestamp when record was last updated",
    )


class UUIDPrimaryKeyMixin:
    """
    Mixin that provides a UUID version 4 primary key.
    Uses standard SQLAlchemy Uuid which maps to native PostgreSQL UUID.
    """

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        nullable=False,
        comment="Unique identifier (UUID v4)",
    )
