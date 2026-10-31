"""
Database package for Brightloop 360.
Provides the engine, session management, base declarative classes, and all models.
"""

from database.base import Base, TimestampMixin, UUIDPrimaryKeyMixin
from database.connection import (
    SessionLocal,
    create_db_engine,
    engine,
    get_database_url,
    get_db,
    get_db_context,
    init_db,
    verify_connection,
)
from database.models import (
    BillingCycle,
    Customer,
    DiscountRule,
    DiscountScope,
    DiscountType,
    Invoice,
    InvoiceLine,
    InvoiceStatus,
    Payment,
    Plan,
    PlanBillingCycle,
    Product,
    ProductVariant,
    QuotationTemplate,
    QuotationTemplateLine,
    Subscription,
    SubscriptionLine,
    SubscriptionStatus,
    TaxRule,
    User,
    UserRole,
)

# Convenient alias
check_connection = verify_connection

__all__ = [
    # Engine & Session
    "Base",
    "TimestampMixin",
    "UUIDPrimaryKeyMixin",
    "engine",
    "SessionLocal",
    "create_db_engine",
    "get_database_url",
    "get_db",
    "get_db_context",
    "verify_connection",
    "check_connection",
    "init_db",
    # Models
    "Customer",
    "Product",
    "ProductVariant",
    "Plan",
    "PlanBillingCycle",
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
    "DiscountRule",
    "DiscountType",
    "DiscountScope",
    "User",
    "UserRole",
]
