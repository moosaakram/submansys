"""
Addon Model for SubMan / Brightloop 360.
Supplementary modular components attachable to customer subscriptions.
"""

import enum
from decimal import Decimal
from typing import Optional
from sqlalchemy import Boolean, CheckConstraint, Enum as SAEnum, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin


class AddonBillingType(str, enum.Enum):
    RECURRING = "recurring"
    ONE_TIME = "one_time"
    USAGE_METERED = "usage_metered"


class Addon(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    """
    Supplementary services or add-on licenses for subscriptions.
    """
    __tablename__ = "addons"

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
        index=True,
        comment="Addon display title",
    )

    code: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True,
        index=True,
        comment="Unique addon code identifier (e.g., ADDON-AI-COPILOT)",
    )

    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
        comment="Addon description",
    )

    unit_price: Mapped[Decimal] = mapped_column(
        Numeric(12, 2),
        nullable=False,
        default=Decimal("0.00"),
        comment="Base price per billing unit",
    )

    billing_type: Mapped[AddonBillingType] = mapped_column(
        SAEnum(AddonBillingType, name="addon_billing_type", native_enum=False),
        nullable=False,
        default=AddonBillingType.RECURRING,
        comment="Billing recurrence model: recurring, one_time, usage_metered",
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
        comment="Active flag",
    )

    __table_args__ = (
        CheckConstraint("unit_price >= 0", name="chk_addon_unit_price_non_negative"),
    )
