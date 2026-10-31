"""
Tax Rule Models for Brightloop 360.
Configured by administrators for automated billing tax calculation.
"""

from decimal import Decimal
from sqlalchemy import Boolean, CheckConstraint, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class TaxRule(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Represents an administrative tax calculation rule (e.g. VAT, GST, Sales Tax).
    Applied to subscription lines and invoices automatically.
    """

    __tablename__ = "tax_rules"

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
        comment="Human-readable tax description (e.g., 'VAT 10%', 'Standard Sales Tax 8%')",
    )

    rate: Mapped[Decimal] = mapped_column(
        Numeric(5, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Tax rate percentage (e.g., 10.00 represents 10.00%)",
    )

    tax_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="percentage",
        comment="Tax type classification ('percentage', 'fixed')",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=True,
        comment="Indicates whether this tax rule is actively selectable for new items",
    )

    __table_args__ = (
        CheckConstraint("rate >= 0", name="chk_tax_rules_rate_non_negative"),
    )

    def __repr__(self) -> str:
        return f"<TaxRule(id={self.id!r}, name={self.name!r}, rate={self.rate!r}%, active={self.is_active!r})>"
