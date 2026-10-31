"""
Tax Rule Model for Brightloop 360.
Configured by Admin to automatically calculate taxes on quotations, subscriptions, and invoices.
"""

from decimal import Decimal
from sqlalchemy import Boolean, CheckConstraint, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class TaxRule(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Tax calculation rules configured by administrators.
    """
    __tablename__ = "tax_rules"

    name: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
        comment="Tax identifier (e.g., Standard VAT 10%, Sales Tax 8.25%)",
    )

    rate: Mapped[Decimal] = mapped_column(
        Numeric(6, 3),
        nullable=False,
        default=Decimal("0.000"),
        comment="Tax rate percentage (e.g., 10.000 for 10%)",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Whether this tax rule is actively applied to new invoices",
    )

    __table_args__ = (
        CheckConstraint("rate >= 0", name="chk_tax_rules_rate_non_negative"),
    )

    def calculate_tax(self, taxable_amount: Decimal) -> Decimal:
        """Calculates tax amount on a given taxable base."""
        return (taxable_amount * self.rate) / Decimal("100.00")
