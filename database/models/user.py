"""
User and Authentication Model for Brightloop 360.
Implements Role-Based Access Control (Admin, Staff, Customer).
"""

import enum
import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import Boolean, DateTime, Enum as SAEnum, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class UserRole(str, enum.Enum):
    ADMIN = "admin"
    STAFF = "staff"
    CUSTOMER = "customer"


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Represents an authenticated user within Brightloop 360.
    """
    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
        comment="Unique user login email",
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Bcrypt hashed password",
    )

    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="User full legal name",
    )

    role: Mapped[UserRole] = mapped_column(
        SAEnum(
            UserRole,
            name="user_role_enum",
            native_enum=False,
            values_callable=lambda obj: [e.value for e in obj],
        ),
        nullable=False,
        default=UserRole.CUSTOMER,
        index=True,
        comment="User role (admin, staff, customer)",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Active account flag",
    )

    # Optional link to customer record if role is customer
    customer_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("customers.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Linked customer record if customer role",
    )

    reset_token: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Password reset verification token",
    )

    reset_token_expiry: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        comment="Expiry timestamp for password reset token",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id!r}, email={self.email!r}, role={self.role.value!r})>"
