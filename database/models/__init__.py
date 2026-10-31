"""
Models package for Brightloop 360 Subscription Management System.
Exports all database entities, enumerations, and mixins.
"""

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from database.models.customer import Customer
from database.models.discount import (
    DiscountRule,
    DiscountScope,
    DiscountType,
    SubscriptionDiscount,
)
from database.models.invoice import (
    Invoice,
    InvoiceLine,
    InvoiceStatus,
)
from database.models.payment import (
    Payment,
    PaymentMethod,
    PaymentStatus,
)
from database.models.plan import (
    BillingCycle,
    Plan,
)
from database.models.product import Product
from database.models.product_variant import ProductVariant
from database.models.quotation import (
    QuotationTemplate,
    QuotationTemplateLine,
)
from database.models.subscription import (
    Subscription,
    SubscriptionStatus,
)
from database.models.subscription_line import SubscriptionLine
from database.models.tax import TaxRule
from database.models.user import (
    PasswordResetToken,
    User,
    UserRole,
)

__all__ = [
    # Base & Mixins
    "Base",
    "UUIDPrimaryKeyMixin",
    "TimestampMixin",
    # Core Entities
    "Customer",
    "Product",
    "ProductVariant",
    "Plan",
    "BillingCycle",
    "QuotationTemplate",
    "QuotationTemplateLine",
    "Subscription",
    "SubscriptionStatus",
    "SubscriptionLine",
    "TaxRule",
    "Invoice",
    "InvoiceStatus",
    "InvoiceLine",
    "Payment",
    "PaymentMethod",
    "PaymentStatus",
    "DiscountRule",
    "DiscountType",
    "DiscountScope",
    "SubscriptionDiscount",
    "User",
    "UserRole",
    "PasswordResetToken",
]
