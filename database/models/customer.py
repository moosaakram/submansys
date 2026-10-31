"""
Customer Model for Brightloop 360 Subscription Management System.
"""

from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from database.models.invoice import Invoice
    from database.models.subscription import Subscription
    from database.models.user import User


class Customer(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Represents a client / customer within Brightloop 360.
    Holds primary contact details and references all active or historical subscriptions.
    """

    __tablename__ = "customers"

    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        comment="Customer full legal or contact name",
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
        comment="Unique customer email address",
    )

    phone: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        comment="Customer phone number",
    )

    company_name: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
        comment="Customer business / company organization name",
    )

    # Relationships
    subscriptions: Mapped[List["Subscription"]] = relationship(
        "Subscription",
        back_populates="customer",
        cascade="all, delete-orphan",
        lazy="selectin",
    )

    users: Mapped[List["User"]] = relationship(
        "User",
        back_populates="customer",
        lazy="selectin",
    )

    invoices: Mapped[List["Invoice"]] = relationship(
        "Invoice",
        back_populates="customer",
        lazy="selectin",
    )

    def __repr__(self) -> str:
        return (
            f"<Customer(id={self.id!r}, email={self.email!r}, "
            f"full_name={self.full_name!r}, company_name={self.company_name!r})>"
        )
