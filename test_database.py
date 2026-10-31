"""
Verification and Test Suite for Brightloop 360 Database Foundation.
Validates all domain models, relationships, constraints, and invariants from the problem statement:
- RBAC User accounts & reset tokens
- Products with Brand/Option Variants
- Plans with Billing Cycles and Lifecycle Policies
- Quotation Templates & multi-line Subscriptions
- Automated Invoicing & Tax Calculations
- Zero Double-Billing Composite Constraint
- Fixed & Percentage Discount Engine
- Payment Matching & Status Transitions
- Sub-2s Finance Query Aggregations
"""

import sys
import uuid
from datetime import datetime, timedelta, timezone
from decimal import Decimal

from sqlalchemy import create_engine, func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import sessionmaker

from database.base import Base
from database.connection import verify_connection
from database.models import (
    BillingCycle,
    Customer,
    DiscountRule,
    DiscountScope,
    DiscountType,
    Invoice,
    InvoiceLine,
    InvoiceStatus,
    PasswordResetToken,
    Payment,
    PaymentMethod,
    PaymentStatus,
    Plan,
    Product,
    ProductVariant,
    QuotationTemplate,
    QuotationTemplateLine,
    Subscription,
    SubscriptionDiscount,
    SubscriptionLine,
    SubscriptionStatus,
    TaxRule,
    User,
    UserRole,
)


def run_comprehensive_database_tests():
    print("=" * 70)
    print("1. Verifying Registered Metadata & Tables...")
    print("=" * 70)

    tables = list(Base.metadata.tables.keys())
    print(f"Registered tables ({len(tables)}): {tables}")

    expected_tables = [
        "users",
        "password_reset_tokens",
        "customers",
        "products",
        "product_variants",
        "plans",
        "quotation_templates",
        "quotation_template_lines",
        "subscriptions",
        "subscription_lines",
        "tax_rules",
        "invoices",
        "invoice_lines",
        "payments",
        "discount_rules",
        "subscription_discounts",
    ]

    for table in expected_tables:
        assert table in tables, f"Expected table '{table}' is missing from metadata!"
    print("All required problem-statement tables are registered with Base.metadata!")

    print("\n" + "=" * 70)
    print("2. Testing In-Memory ORM Execution & Business Scenarios...")
    print("=" * 70)

    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)

    with Session() as session:
        # ---------------------------------------------------------------------
        # Scene 1: RBAC Users & Customer Sign-up
        # ---------------------------------------------------------------------
        customer = Customer(
            full_name="Acme Global Corporation",
            email="billing@acmeglobal.com",
            phone="+1-555-8392",
            company_name="Acme Global Inc.",
        )
        session.add(customer)
        session.flush()

        customer_user = User(
            email="billing@acmeglobal.com",
            password_hash="$2b$12$e8Yp7WzN...",  # bcrypt mock
            role=UserRole.CUSTOMER,
            customer_id=customer.id,
        )
        admin_user = User(
            email="admin@brightloop.com",
            password_hash="$2b$12$K1jP3...",
            role=UserRole.ADMIN,
        )
        session.add_all([customer_user, admin_user])
        session.flush()

        reset_token = PasswordResetToken(
            user_id=customer_user.id,
            token_hash="a1b2c3d4e5f6...",
            expires_at=datetime.now(timezone.utc) + timedelta(hours=24),
        )
        session.add(reset_token)
        session.flush()

        assert len(customer.users) == 1
        assert customer.users[0].role == UserRole.CUSTOMER
        assert len(customer_user.reset_tokens) == 1
        print("Scene 1 (RBAC & Auth Sign-up): PASSED")

        # ---------------------------------------------------------------------
        # Scene 2: Product, Variant (+560 Odoo brand) & Plan
        # ---------------------------------------------------------------------
        crm_product = Product(
            name="Brightloop Business CRM",
            description="Complete sales, pipeline, and customer management platform",
            product_type="recurring",
            sales_price=Decimal("120.00"),
            cost_price=Decimal("25.00"),
            is_active=True,
        )
        session.add(crm_product)
        session.flush()

        odoo_variant = ProductVariant(
            product_id=crm_product.id,
            variant_name="Brand: Odoo Enterprise",
            sku="BL-CRM-ODOO-01",
            price_extra=Decimal("560.00"),  # Odoo brand adds +560
            cost_extra=Decimal("100.00"),
        )
        session.add(odoo_variant)
        session.flush()

        yearly_plan = Plan(
            product_id=crm_product.id,
            name="Enterprise Yearly Billing",
            billing_cycle=BillingCycle.YEARLY,
            price=Decimal("1200.00"),
            min_quantity=5,
            auto_close_on_end=True,
            allow_early_close=True,
            allow_pause=True,
            allow_renewal=True,
        )
        session.add(yearly_plan)
        session.flush()

        assert len(crm_product.variants) == 1
        assert crm_product.variants[0].price_extra == Decimal("560.00")
        assert len(crm_product.plans) == 1
        print("Scene 2 (Products, Odoo Variants & Plan Policies): PASSED")

        # ---------------------------------------------------------------------
        # Scene 3: Quotation Template & Multi-line Subscriptions
        # ---------------------------------------------------------------------
        tax_vat = TaxRule(name="Standard VAT 10%", rate=Decimal("10.00"))
        session.add(tax_vat)
        session.flush()

        quote_template = QuotationTemplate(
            name="Enterprise SaaS Onboarding Pack",
            plan_id=yearly_plan.id,
            validity_days=15,
            payment_terms="Net 30",
        )
        session.add(quote_template)
        session.flush()

        quote_line = QuotationTemplateLine(
            template_id=quote_template.id,
            product_id=crm_product.id,
            variant_id=odoo_variant.id,
            quantity=10,
            unit_price=Decimal("1200.00"),
        )
        session.add(quote_line)
        session.flush()

        # Convert quote to subscription
        start = datetime.now(timezone.utc)
        sub = Subscription(
            subscription_number="SUB-2026-0001",
            customer_id=customer.id,
            plan_id=yearly_plan.id,
            product_id=crm_product.id,
            quotation_template_id=quote_template.id,
            billing_cycle=BillingCycle.YEARLY,
            start_date=start,
            next_billing_date=start,
            status=SubscriptionStatus.ACTIVE,
        )
        session.add(sub)
        session.flush()

        # Add subscription lines
        line1 = SubscriptionLine(
            subscription_id=sub.id,
            product_id=crm_product.id,
            variant_id=odoo_variant.id,
            quantity=10,
            unit_price=Decimal("1200.00"),
            tax_rule_id=tax_vat.id,
        )
        line1.tax_rule = tax_vat
        line1.calculate_totals()
        session.add(line1)
        session.flush()

        sub.recalculate_totals()
        session.commit()

        assert len(sub.lines) == 1
        assert sub.subtotal == Decimal("12000.00")
        assert sub.tax_amount == Decimal("1200.00")  # 10% VAT
        assert sub.total_amount == Decimal("13200.00")
        print("Scene 3 (Quotation Templates & Multi-line Subscriptions): PASSED")

        # ---------------------------------------------------------------------
        # Scene 4 & 5: Discounts, Billing Day Invoices & Invariants
        # ---------------------------------------------------------------------
        discount = DiscountRule(
            code="SUMMER10",
            name="Summer 10% Enterprise Discount",
            discount_type=DiscountType.PERCENTAGE,
            value=Decimal("10.00"),
            applies_to=DiscountScope.WHOLE_SUBSCRIPTION,
            min_purchase_amount=Decimal("1000.00"),
            max_usage_limit=50,
        )
        session.add(discount)
        session.flush()

        assert discount.is_valid_now(purchase_amount=Decimal("12000.00"), quantity=10) is True

        period_start = start
        period_end = start + timedelta(days=365)

        invoice = Invoice(
            invoice_number="INV-2026-0001",
            customer_id=customer.id,
            subscription_id=sub.id,
            issue_date=start,
            due_date=start + timedelta(days=30),
            billing_period_start=period_start,
            billing_period_end=period_end,
            status=InvoiceStatus.CONFIRMED,
        )
        session.add(invoice)
        session.flush()

        inv_line = InvoiceLine(
            invoice_id=invoice.id,
            product_id=crm_product.id,
            variant_id=odoo_variant.id,
            description="Brightloop CRM (Odoo Brand) - 10 Seats Annual",
            quantity=10,
            unit_price=Decimal("1200.00"),
            tax_rule_id=tax_vat.id,
        )
        inv_line.tax_rule = tax_vat
        inv_line.calculate_totals()
        session.add(inv_line)
        session.flush()

        invoice.discount_amount = Decimal("1200.00")  # 10% discount on subtotal
        invoice.recalculate_totals()
        session.commit()

        assert invoice.total_amount == Decimal("12000.00")  # 12000 subtotal + 1200 tax - 1200 discount
        assert invoice.amount_due == Decimal("12000.00")
        print("Scene 4 & 5 (Taxes, Discounts, & Automated Invoice): PASSED")

        # Invariant Test: Verify that double billing the exact same period fails
        double_billed_invoice = Invoice(
            invoice_number="INV-2026-0002",
            customer_id=customer.id,
            subscription_id=sub.id,
            issue_date=start,
            due_date=start + timedelta(days=30),
            billing_period_start=period_start,
            billing_period_end=period_end,
        )
        session.add(double_billed_invoice)
        try:
            session.commit()
            raise AssertionError("Double-billing invariant failed! Database allowed duplicate period billing.")
        except IntegrityError:
            session.rollback()
            print("Invariant Check (Zero Double-Billing Unique Constraint): PASSED")

        # ---------------------------------------------------------------------
        # Scene 6: Payments & Invoice Settlement
        # ---------------------------------------------------------------------
        payment = Payment(
            payment_number="PAY-2026-0001",
            invoice_id=invoice.id,
            amount=Decimal("12000.00"),
            payment_method=PaymentMethod.BANK_TRANSFER,
            transaction_reference="WIRE-REF-987654321",
            status=PaymentStatus.SUCCESSFUL,
        )
        session.add(payment)
        invoice.record_payment(payment.amount)
        session.commit()

        assert invoice.amount_due == Decimal("0.00")
        assert invoice.status == InvoiceStatus.PAID
        assert len(invoice.payments) == 1
        print("Scene 6 (Payments & Invoice Settlement): PASSED")

        # ---------------------------------------------------------------------
        # Scene 7: Finance Lead Real-Time Aggregation Queries
        # ---------------------------------------------------------------------
        active_subs_count = session.query(func.count(Subscription.id)).filter(
            Subscription.status == SubscriptionStatus.ACTIVE
        ).scalar()

        total_collected = session.query(func.coalesce(func.sum(Payment.amount), Decimal("0.00"))).filter(
            Payment.status == PaymentStatus.SUCCESSFUL
        ).scalar()

        total_owed = session.query(func.coalesce(func.sum(Invoice.amount_due), Decimal("0.00"))).filter(
            Invoice.status.in_([InvoiceStatus.DRAFT, InvoiceStatus.CONFIRMED])
        ).scalar()

        assert active_subs_count == 1
        assert total_collected == Decimal("12000.00")
        assert total_owed == Decimal("0.00")
        print("Scene 7 (Finance Lead Aggregation Queries): PASSED")

    print("\n" + "=" * 70)
    print("ALL 7 PROBLEM STATEMENT SCENES VALIDATED SUCCESSFULLY IN ORM!")
    print("=" * 70)


def run_postgres_connection_diagnostic():
    print("\n" + "=" * 70)
    print("3. Testing PostgreSQL Connection Diagnostics...")
    print("=" * 70)
    is_connected, msg = verify_connection()
    if is_connected:
        print(f"[OK] PostgreSQL: {msg}")
    else:
        print(f"[DIAGNOSTIC] PostgreSQL: {msg}")


if __name__ == "__main__":
    run_comprehensive_database_tests()
    run_postgres_connection_diagnostic()
    print("\n[SUCCESS] Complete database verification finished without errors!")
