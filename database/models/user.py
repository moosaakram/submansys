"""
User and Authentication Models for Brightloop 360.
Implements Role-Based Access Control (RBAC) and password reset tokens.
"""

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING, List, Optional

from sqlalchemy import Boolean, DateTime, Enum as SAEnum, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from database.models.customer import Customer


class UserRole(str, enum.Enum):
    """
    Role-Based Access Control (RBAC) classifications.
    - ADMIN: Complete system control (staff, plans, products, taxes, discounts).
    - STAFF: Internal operations (quotations, subscriptions, invoices, payments).
    - CUSTOMER: Self-service portal (view/manage their own subscriptions & invoices).
    """
    ADMIN = "admin"
    STAFF = "staff"
    CUSTOMER = "customer"


class User(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    User account credentials and role assignments.
    """

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
        comment="Unique user login email address (case-insensitive)",
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Hashed password (bcrypt / argon2)",
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
        comment="System access role (admin, staff, customer)",
    )

    customer_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("customers.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Associated customer entity profile if role is CUSTOMER",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="Indicates whether the user account is active",
    )

    # Relationships
    customer: Mapped[Optional["Customer"]] = relationship(
        "Customer",
        back_populates="users",
        lazy="selectin",
    )

    reset_tokens: Mapped[List["PasswordResetToken"]] = relationship(
        "PasswordResetToken",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id!r}, email={self.email!r}, role={self.role!r}, active={self.is_active!r})>"


class PasswordResetToken(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Time-limited security tokens for self-service password reset flows.
    """

    __tablename__ = "password_reset_tokens"

    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
        comment="Foreign key referencing the requesting user",
    )

    token_hash: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
        comment="Cryptographic token hash for password reset URL",
    )

    expires_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        comment="Token expiration timestamp",
    )

    is_used: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        comment="Flag indicating if token has already been consumed",
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="reset_tokens",
    )

    def __repr__(self) -> str:
        return f"<PasswordResetToken(id={self.id!r}, user_id={self.user_id!r}, used={self.is_used!r})>"
