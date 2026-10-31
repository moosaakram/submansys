"""
Database session management and initial data seeding for Brightloop 360.
Ensures the backend runs out-of-the-box with PostgreSQL or automatic SQLite fallback.
"""

import logging
import os
import sys
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from pathlib import Path
from typing import Generator

# Ensure workspace root is in sys.path so 'database' package can be resolved
BACKEND_DIR = Path(__file__).resolve().parent.parent.parent
ROOT_DIR = BACKEND_DIR.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from sqlalchemy import create_engine
from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session, sessionmaker

from database.base import Base
from database.connection import get_database_url, verify_connection
from database.models import (
    BillingCycle,
    Customer,
    DiscountRule,
    DiscountScope,
    DiscountType,
    Invoice,
    InvoiceLine,
    InvoiceStatus,
    Plan,
    PlanBillingCycle,
    Product,
    ProductVariant,
    Subscription,
    SubscriptionLine,
    SubscriptionStatus,
    TaxRule,
    User,
    UserRole,
)
from app.core.security import hash_password

logger = logging.getLogger("brightloop360.core.database")

# Initialize database engine: test PostgreSQL, fallback to SQLite if PostgreSQL server is offline
_active_engine: Engine = None
_SessionLocal = None


def get_engine() -> Engine:
    global _active_engine, _SessionLocal
    if _active_engine is not None:
        return _active_engine

    db_url = get_database_url()
    is_postgres_ok = False

    if not db_url.startswith("sqlite"):
        try:
            temp_engine = create_engine(db_url, pool_pre_ping=True)
            is_postgres_ok, msg = verify_connection(temp_engine)
            if is_postgres_ok:
                _active_engine = temp_engine
                logger.info("Connected to PostgreSQL successfully.")
            else:
                logger.warning(f"PostgreSQL connection failed ({msg}). Falling back to SQLite for local execution.")
        except Exception as exc:
            logger.warning(f"PostgreSQL initialization failed ({exc}). Falling back to SQLite.")

    if _active_engine is None:
        if db_url.startswith("sqlite"):
            _active_engine = create_engine(
                db_url,
                connect_args={"check_same_thread": False},
                echo=False,
            )
            logger.info(f"Using SQLite database specified in DATABASE_URL: {db_url}")
        else:
            sqlite_path = BACKEND_DIR / "brightloop360.db"
            sqlite_url = f"sqlite:///{sqlite_path}"
            _active_engine = create_engine(
                sqlite_url,
                connect_args={"check_same_thread": False},
                echo=False,
            )
            logger.info(f"Using SQLite database at {sqlite_path}")

    _SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_active_engine)
    
    # Auto-create tables in active engine
    Base.metadata.create_all(bind=_active_engine)
    
    # Seed initial test data
    seed_demo_data()
    
    return _active_engine


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency that provides a transactional database session."""
    get_engine()
    db = _SessionLocal()
    try:
        yield db
    finally:
        db.close()


def seed_demo_data():
    """Seeds initial demonstration data required by the problem statement if empty."""
    db = _SessionLocal()
    try:
        # 1. Seed Users (Admin, Staff, Customer)
        seed_accounts = [
            ("admin@brightloop.com", "Admin Director", "Admin@12345!", UserRole.ADMIN, None),
            ("alex.mercer@brightloop.io", "Alex Mercer", "Admin@12345!", UserRole.ADMIN, None),
            ("staff@brightloop.com", "Sarah Sales Rep", "Staff@12345!", UserRole.STAFF, None),
            ("marcus.v@brightloop.io", "Marcus Vance", "Staff@12345!", UserRole.STAFF, None),
            ("customer@acme.com", "John Customer", "Customer@12345!", UserRole.CUSTOMER, "Acme Technologies Inc."),
            ("sarah.j@acmetech.io", "Sarah Jenkins", "Customer@12345!", UserRole.CUSTOMER, "Acme Technologies Inc."),
            ("d.alvarez@orbitflow.co", "David Alvarez", "Customer@12345!", UserRole.CUSTOMER, "OrbitFlow Logistics"),
        ]
        users_to_add = []
        for email, full_name, raw_pw, role, company in seed_accounts:
            existing = db.query(User).filter(User.email == email.lower()).first()
            if not existing:
                cust_id = None
                if role == UserRole.CUSTOMER:
                    cust = db.query(Customer).filter(Customer.email == email.lower()).first()
                    if not cust:
                        cust = Customer(full_name=full_name, email=email.lower(), company_name=company or full_name)
                        db.add(cust)
                        db.flush()
                    cust_id = cust.id
                u = User(
                    email=email.lower(),
                    full_name=full_name,
                    hashed_password=hash_password(raw_pw),
                    role=role,
                    is_active=True,
                    customer_id=cust_id,
                )
                users_to_add.append(u)
        if users_to_add:
            db.add_all(users_to_add)
            db.commit()

        # 2. Seed Tax Rules
        tax_rule = db.query(TaxRule).first()
        if not tax_rule:
            standard_vat = TaxRule(name="Standard VAT (10%)", rate=Decimal("10.000"), is_active=True)
            sales_tax = TaxRule(name="State Sales Tax (8%)", rate=Decimal("8.000"), is_active=True)
            db.add_all([standard_vat, sales_tax])
            db.commit()

        # 3. Seed Products and Variants (e.g. Odoo brand adds 560 to price)
        product = db.query(Product).first()
        if not product:
            business_sw = Product(
                name="Brightloop Business Suite",
                description="Core cloud business software suite with recurring monthly/yearly billing",
                product_type="recurring",
                sales_price=Decimal("1200.00"),
                cost_price=Decimal("400.00"),
                is_active=True,
            )
            analytics_addon = Product(
                name="AI Revenue Analytics Add-on",
                description="Optional add-on customers can switch on and off",
                product_type="add_on",
                sales_price=Decimal("350.00"),
                cost_price=Decimal("100.00"),
                is_active=True,
            )
            db.add_all([business_sw, analytics_addon])
            db.commit()

            # Add variants (Odoo brand adds 560 to price)
            odoo_variant = ProductVariant(
                product_id=business_sw.id,
                attribute_name="Brand",
                attribute_value="Odoo",
                price_extra=Decimal("560.00"),
                is_active=True,
            )
            standard_variant = ProductVariant(
                product_id=business_sw.id,
                attribute_name="Brand",
                attribute_value="Standard",
                price_extra=Decimal("0.00"),
                is_active=True,
            )
            db.add_all([odoo_variant, standard_variant])
            db.commit()

        # 4. Seed Plans (monthly, yearly with lifecycle options)
        plan = db.query(Plan).first()
        if not plan:
            now = datetime.now(timezone.utc)
            monthly_plan = Plan(
                name="Pro Monthly Plan",
                description="Standard monthly recurring subscription plan",
                cost=Decimal("1200.00"),
                billing_cycle=PlanBillingCycle.MONTHLY,
                minimum_quantity=1,
                start_date=now - timedelta(days=60),
                auto_close=False,
                allow_early_close=True,
                allow_pause=True,
                allow_renew=True,
                is_active=True,
            )
            annual_plan = Plan(
                name="Enterprise Annual Contract",
                description="Yearly billed enterprise contract with auto-close",
                cost=Decimal("12000.00"),
                billing_cycle=PlanBillingCycle.YEARLY,
                minimum_quantity=5,
                start_date=now - timedelta(days=30),
                auto_close=True,
                allow_early_close=False,
                allow_pause=False,
                allow_renew=True,
                is_active=True,
            )
            db.add_all([monthly_plan, annual_plan])
            db.commit()

        # 5. Seed Discount Rules (admin discount rules)
        discount = db.query(DiscountRule).first()
        if not discount:
            now = datetime.now(timezone.utc)
            vol_discount = DiscountRule(
                name="Volume Seats 15% Off",
                code="VOLUME15",
                discount_type=DiscountType.PERCENTAGE,
                value=Decimal("15.00"),
                min_quantity=10,
                start_date=now - timedelta(days=30),
                end_date=now + timedelta(days=180),
                max_uses=100,
                current_uses=0,
                scope=DiscountScope.WHOLE_SUBSCRIPTION,
                is_active=True,
            )
            fixed_discount = DiscountRule(
                name="Welcome Credit $200",
                code="WELCOME200",
                discount_type=DiscountType.FIXED_AMOUNT,
                value=Decimal("200.00"),
                min_purchase_amount=Decimal("1000.00"),
                start_date=now - timedelta(days=30),
                end_date=now + timedelta(days=90),
                max_uses=50,
                current_uses=2,
                scope=DiscountScope.WHOLE_SUBSCRIPTION,
                is_active=True,
            )
            db.add_all([vol_discount, fixed_discount])
            db.commit()

        # 6. Seed Sample Customer & Active Subscription with Invoices
        customer = db.query(Customer).first()
        if not customer:
            acme = Customer(
                full_name="Acme Global Industries",
                email="billing@acme.com",
                phone="+1-555-0199",
                company_name="Acme Corp",
            )
            db.add(acme)
            db.commit()

            # Create an active subscription
            first_product = db.query(Product).first()
            first_plan = db.query(Plan).first()
            now = datetime.now(timezone.utc)
            
            sub = Subscription(
                subscription_number="SUB-2026-0001",
                customer_id=acme.id,
                plan_id=first_plan.id if first_plan else None,
                product_id=first_product.id if first_product else None,
                billing_cycle=BillingCycle.MONTHLY,
                quantity=12,
                unit_price=Decimal("1200.00"),
                total_amount=Decimal("14400.00"),
                start_date=now - timedelta(days=45),
                expiry_date=now + timedelta(days=320),
                payment_terms="Net 30",
                payment_method="credit_card",
                status=SubscriptionStatus.ACTIVE,
                last_billed_date=now - timedelta(days=15),
                next_billing_date=now + timedelta(days=15),
                auto_close=False,
                allow_early_close=True,
                allow_pause=True,
                allow_renew=True,
            )
            db.add(sub)
            db.commit()

            # Add subscription line
            sub_line = SubscriptionLine(
                subscription_id=sub.id,
                product_id=first_product.id,
                product_name=first_product.name,
                quantity=12,
                unit_price=Decimal("1200.00"),
                tax_rate=Decimal("10.000"),
                amount=Decimal("14400.00"),
            )
            db.add(sub_line)
            db.commit()

            # Add sample invoice
            inv = Invoice(
                invoice_number="INV-2026-0001",
                subscription_id=sub.id,
                customer_id=acme.id,
                customer_name=acme.full_name,
                customer_email=acme.email,
                issue_date=now - timedelta(days=15),
                due_date=now + timedelta(days=15),
                status=InvoiceStatus.CONFIRMED,
                subtotal=Decimal("14400.00"),
                tax_amount=Decimal("1440.00"),
                discount_amount=Decimal("2160.00"),  # 15% volume discount
                total_amount=Decimal("13680.00"),
                paid_amount=Decimal("0.00"),
                notes="Automated recurring invoice generated on billing day",
            )
            db.add(inv)
            db.commit()

    except Exception as exc:
        logger.error(f"Error seeding demo data: {exc}", exc_info=True)
        db.rollback()
    finally:
        db.close()
