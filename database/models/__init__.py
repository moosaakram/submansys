"""
Models package for Brightloop 360 / SubMan Subscription Management System.
Exports all database entities, enumerations, and mixins.
"""

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from database.models.customer import Customer
from database.models.discount import DiscountRule, DiscountScope, DiscountType
from database.models.discount_redemption import (
    DiscountProduct,
    DiscountRedemption,
    DiscountRedemptionStatus,
)
from database.models.invoice import Invoice, InvoiceKind, InvoiceLine, InvoiceStatus
from database.models.payment import Payment, PaymentStatus, PaymentType
from database.models.payment_term import PaymentTerm
from database.models.plan import Plan, PlanBillingCycle
from database.models.plan_item import PlanItem
from database.models.product import Product
from database.models.product_category import ProductCategory
from database.models.product_variant import ProductVariant
from database.models.addon import Addon, AddonBillingType
from database.models.quotation import Quotation, QuotationItem, QuotationStatus
from database.models.quotation_template import (
    QuotationTemplate,
    QuotationTemplateLine,
)
from database.models.sales_order import SalesOrder, SalesOrderItem, SalesOrderStatus
from database.models.subscription import (
    BillingCycle,
    Subscription,
    SubscriptionLine,
    SubscriptionStatus,
)
from database.models.subscription_event import SubscriptionEvent
from database.models.billing_run import (
    BillingRun,
    BillingRunItem,
    BillingRunItemStatus,
    BillingRunStatus,
)
from database.models.tax import TaxRule
from database.models.user import User, UserRole

__all__ = [
    # Base & Mixins
    "Base",
    "UUIDPrimaryKeyMixin",
    "TimestampMixin",
    # Core User & Customer
    "User",
    "UserRole",
    "Customer",
    # Catalogue & Add-ons
    "ProductCategory",
    "Product",
    "ProductVariant",
    "Addon",
    "AddonBillingType",
    # Plans & Plan Items
    "Plan",
    "PlanBillingCycle",
    "PlanItem",
    # Payment Terms
    "PaymentTerm",
    # Quotations & Templates
    "QuotationTemplate",
    "QuotationTemplateLine",
    "Quotation",
    "QuotationItem",
    "QuotationStatus",
    # Sales Orders
    "SalesOrder",
    "SalesOrderItem",
    "SalesOrderStatus",
    # Subscriptions & Events
    "Subscription",
    "SubscriptionLine",
    "BillingCycle",
    "SubscriptionStatus",
    "SubscriptionEvent",
    # Discounts & Redemptions
    "DiscountRule",
    "DiscountType",
    "DiscountScope",
    "DiscountProduct",
    "DiscountRedemption",
    "DiscountRedemptionStatus",
    # Taxes
    "TaxRule",
    # Invoices & Items
    "Invoice",
    "InvoiceLine",
    "InvoiceStatus",
    "InvoiceKind",
    # Payments
    "Payment",
    "PaymentType",
    "PaymentStatus",
    # Recurring Billing Runs
    "BillingRun",
    "BillingRunItem",
    "BillingRunStatus",
    "BillingRunItemStatus",
]
