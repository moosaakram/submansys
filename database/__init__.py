"""
Database package for Brightloop 360.
Provides the engine, session management, base declarative classes, and models.
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
    Product,
    Subscription,
    SubscriptionStatus,
)

# Convenient alias
check_connection = verify_connection

__all__ = [
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
    "Customer",
    "Product",
    "Subscription",
    "BillingCycle",
    "SubscriptionStatus",
]

