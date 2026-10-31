"""
Verification and Test Suite for Brightloop 360 Database Foundation.
Validates model definitions, relationships, constraints, and engine session handling.
"""

import sys
from datetime import datetime, timezone
from decimal import Decimal
import uuid

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from database.base import Base
from database.connection import verify_connection
from database.models import (
    BillingCycle,
    Customer,
    Product,
    Subscription,
    SubscriptionStatus,
)


def run_model_verification():
    print("=" * 60)
    print("1. Verifying Model Schemas and Metadata...")
    print("=" * 60)

    tables = list(Base.metadata.tables.keys())
    print(f"Registered tables: {tables}")
    assert "customers" in tables, "customers table missing from metadata!"
    assert "products" in tables, "products table missing from metadata!"
    assert "subscriptions" in tables, "subscriptions table missing from metadata!"
    print("Metadata registration check passed!")

    # Verify Customers table
    cust_table = Base.metadata.tables["customers"]
    assert "id" in cust_table.columns
    assert "email" in cust_table.columns
    assert cust_table.columns["email"].unique is True
    assert "full_name" in cust_table.columns
    assert "created_at" in cust_table.columns
    assert "updated_at" in cust_table.columns
    print("Customer table schema check passed!")

    # Verify Products table
    prod_table = Base.metadata.tables["products"]
    assert "id" in prod_table.columns
    assert "name" in prod_table.columns
    assert "sales_price" in prod_table.columns
    assert "cost_price" in prod_table.columns
    assert "is_active" in prod_table.columns
    print("Product table schema check passed!")

    # Verify Subscriptions table
    sub_table = Base.metadata.tables["subscriptions"]
    assert "id" in sub_table.columns
    assert "customer_id" in sub_table.columns
    assert "product_id" in sub_table.columns
    assert "subscription_number" in sub_table.columns
    assert sub_table.columns["subscription_number"].unique is True
    assert "billing_cycle" in sub_table.columns
    assert "quantity" in sub_table.columns
    assert "unit_price" in sub_table.columns
    assert "start_date" in sub_table.columns
    assert "expiry_date" in sub_table.columns
    assert "status" in sub_table.columns
    print("Subscription table schema check passed!")

    print("\n" + "=" * 60)
    print("2. Testing ORM Table Creation & Operations in In-Memory Engine...")
    print("=" * 60)

    test_engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(test_engine)
    TestSession = sessionmaker(bind=test_engine)

    with TestSession() as session:
        # Create Customer
        customer = Customer(
            full_name="Acme Corporation",
            email="contact@acme.com",
            phone="+1-555-0199",
            company_name="Acme Corp",
        )
        session.add(customer)

        # Create Product
        product = Product(
            name="Cloud Sync Enterprise",
            description="Unlimited cloud storage and priority sync",
            product_type="recurring",
            sales_price=Decimal("99.99"),
            cost_price=Decimal("15.00"),
            is_active=True,
        )
        session.add(product)
        session.flush()

        assert customer.id is not None
        assert product.id is not None
        print(f"Created Customer: {customer.id} ({customer.full_name})")
        print(f"Created Product: {product.id} ({product.name})")

        # Create Subscription
        now = datetime.now(timezone.utc)
        sub = Subscription(
            customer_id=customer.id,
            product_id=product.id,
            subscription_number="SUB-2026-TEST-001",
            billing_cycle=BillingCycle.MONTHLY,
            quantity=5,
            unit_price=Decimal("99.99"),
            start_date=now,
            status=SubscriptionStatus.ACTIVE,
        )
        session.add(sub)
        session.commit()

        # Query & verify relationships
        saved_cust = session.query(Customer).filter_by(email="contact@acme.com").first()
        assert saved_cust is not None
        assert len(saved_cust.subscriptions) == 1
        assert saved_cust.subscriptions[0].subscription_number == "SUB-2026-TEST-001"
        assert saved_cust.subscriptions[0].product.name == "Cloud Sync Enterprise"
        assert saved_cust.subscriptions[0].billing_cycle == BillingCycle.MONTHLY
        assert saved_cust.subscriptions[0].status == SubscriptionStatus.ACTIVE
        print(f"Relationship verification successful: {saved_cust.subscriptions[0]}")

    print("\nORM In-Memory verification completed successfully!")


def run_postgres_connection_check():
    print("\n" + "=" * 60)
    print("3. Testing PostgreSQL Connection Diagnostics...")
    print("=" * 60)
    success, msg = verify_connection()
    if success:
        print(f"PostgreSQL connection active: {msg}")
    else:
        print(f"PostgreSQL connection status: {msg}")
        print("Note: If PostgreSQL server is not yet started or running on a different port,")
        print("update .env with the appropriate credentials and host.")


if __name__ == "__main__":
    run_model_verification()
    run_postgres_connection_check()
    print("\nAll database foundation checks completed!")

