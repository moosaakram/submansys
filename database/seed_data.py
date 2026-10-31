"""
Seed Data Script for Brightloop 360.
Populates the database with realistic business scenarios from the problem statement:
- Admin, Staff, and Customer RBAC users
- Products and Brand Variants (Odoo Brand +$560)
- Monthly and Yearly Plans with Lifecycle Policies
- Tax Rules & Promotional Discounts
- Quotation Templates and Multi-line Subscriptions
- Invoices (Draft, Confirmed, Paid, and Overdue)
- Payments matched to invoices
"""

import sys
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import Optional

from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from database.connection import engine as default_engine, get_db_context, init_db
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


def seed_database(db: Session) -> None:
    print("Seeding Brightloop 360 foundational data...")

    # 1. Tax Rules
    vat_10 = TaxRule(name="VAT 10%", rate=Decimal("10.00"), tax_type="percentage")
    sales_tax_8 = TaxRule(name="US Sales Tax 8%", rate=Decimal("8.00"), tax_type="percentage")
    db.add_all([vat_10, sales_tax_8])
    db.flush()

    # 2. Customers
    small_shop = Customer(
        full_name="Craft Coffee Roasters",
        email="billing@craftcoffee.com",
        phone="+1-555-0101",
        company_name="Craft Coffee Roasters LLC",
    )
    enterprise_client = Customer(
        full_name="Global Logistics Corp",
        email="finance@globallogistics.com",
        phone="+1-555-0199",
        company_name="Global Logistics Inc.",
    )
    db.add_all([small_shop, enterprise_client])
    db.flush()

    # 3. RBAC Users
    admin_user = User(
        email="admin@brightloop.com",
        # Default mock bcrypt hash for password "Admin@12345"
        password_hash="$2b$12$K1jP3vM9Z/4Q7hR1g...",
        role=UserRole.ADMIN,
        is_active=True,
    )
    staff_user = User(
        email="staff@brightloop.com",
        password_hash="$2b$12$K1jP3vM9Z/4Q7hR1g...",
        role=UserRole.STAFF,
        is_active=True,
    )
    customer_user = User(
        email="billing@craftcoffee.com",
        password_hash="$2b$12$K1jP3vM9Z/4Q7hR1g...",
        role=UserRole.CUSTOMER,
        customer_id=small_shop.id,
        is_active=True,
    )
    db.add_all([admin_user, staff_user, customer_user])
    db.flush()

    # 4. Products & Variants (Problem Statement: Odoo brand adds +560)
    crm_prod = Product(
        name="Brightloop CRM Platform",
        description="Comprehensive customer relationship and pipeline tracker",
        product_type="recurring",
        sales_price=Decimal("150.00"),
        cost_price=Decimal("30.00"),
        is_active=True,
    )
    storage_addon = Product(
        name="1TB Extra Cloud Storage Add-on",
        description="Expand document storage for quotes, receipts, and invoices",
        product_type="add_on",
        sales_price=Decimal("25.00"),
        cost_price=Decimal("5.00"),
        is_active=True,
    )
    db.add_all([crm_prod, storage_addon])
    db.flush()

    odoo_variant = ProductVariant(
        product_id=crm_prod.id,
        variant_name="Brand: Odoo Enterprise Integration",
        sku="BL-CRM-ODOO",
        price_extra=Decimal("560.00"),  # Odoo brand adds 560
        cost_extra=Decimal("120.00"),
        is_active=True,
    )
    db.add(odoo_variant)
    db.flush()

    # 5. Plans (Monthly and Yearly with Lifecycle Policies)
    monthly_plan = Plan(
        product_id=crm_prod.id,
        name="Business Starter Monthly",
        billing_cycle=BillingCycle.MONTHLY,
        price=Decimal("150.00"),
        min_quantity=1,
        auto_close_on_end=False,
        allow_early_close=True,
        allow_pause=True,
        allow_renewal=True,
    )
    yearly_plan = Plan(
        product_id=crm_prod.id,
        name="Enterprise Annual Contract",
        billing_cycle=BillingCycle.YEARLY,
        price=Decimal("1500.00"),
        min_quantity=5,
        auto_close_on_end=True,
        allow_early_close=False,
        allow_pause=False,
        allow_renewal=True,
    )
    db.add_all([monthly_plan, yearly_plan])
    db.flush()

    # 6. Quotation Template
    quote_template = QuotationTemplate(
        name="Standard 5-Seat Enterprise Onboarding",
        plan_id=yearly_plan.id,
        validity_days=30,
        payment_terms="Net 30",
        notes="Includes 1 year support and onboarding setup",
    )
    db.add(quote_template)
    db.flush()

    quote_line1 = QuotationTemplateLine(
        template_id=quote_template.id,
        product_id=crm_prod.id,
        variant_id=odoo_variant.id,
        quantity=5,
        unit_price=Decimal("1500.00"),
    )
    quote_line2 = QuotationTemplateLine(
        template_id=quote_template.id,
        product_id=storage_addon.id,
        quantity=2,
        unit_price=Decimal("25.00"),
    )
    db.add_all([quote_line1, quote_line2])
    db.flush()

    # 7. Discount Rules
    volume_discount = DiscountRule(
        code="VOLUME10",
        name="10% Volume Discount",
        discount_type=DiscountType.PERCENTAGE,
        value=Decimal("10.00"),
        applies_to=DiscountScope.WHOLE_SUBSCRIPTION,
        min_purchase_amount=Decimal("1000.00"),
        min_quantity=5,
        max_usage_limit=100,
        is_active=True,
    )
    db.add(volume_discount)
    db.flush()

    # 8. Active Subscriptions
    now = datetime.now(timezone.utc)

    # Subscription A: Small Shop (Monthly)
    sub_small = Subscription(
        subscription_number="SUB-2026-0001",
        customer_id=small_shop.id,
        plan_id=monthly_plan.id,
        product_id=crm_prod.id,
        billing_cycle=BillingCycle.MONTHLY,
        start_date=now - timedelta(days=60),
        next_billing_date=now + timedelta(days=30),
        status=SubscriptionStatus.ACTIVE,
    )
    db.add(sub_small)
    db.flush()

    line_small = SubscriptionLine(
        subscription_id=sub_small.id,
        product_id=crm_prod.id,
        quantity=1,
        unit_price=Decimal("150.00"),
        tax_rule_id=sales_tax_8.id,
    )
    line_small.tax_rule = sales_tax_8
    line_small.calculate_totals()
    db.add(line_small)
    db.flush()
    sub_small.recalculate_totals()

    # Subscription B: Enterprise (Yearly with Odoo Brand)
    sub_ent = Subscription(
        subscription_number="SUB-2026-0002",
        customer_id=enterprise_client.id,
        plan_id=yearly_plan.id,
        product_id=crm_prod.id,
        quotation_template_id=quote_template.id,
        billing_cycle=BillingCycle.YEARLY,
        start_date=now - timedelta(days=30),
        next_billing_date=now + timedelta(days=335),
        status=SubscriptionStatus.ACTIVE,
    )
    db.add(sub_ent)
    db.flush()

    line_ent1 = SubscriptionLine(
        subscription_id=sub_ent.id,
        product_id=crm_prod.id,
        variant_id=odoo_variant.id,
        quantity=10,
        unit_price=Decimal("1500.00"),
        tax_rule_id=vat_10.id,
    )
    line_ent1.tax_rule = vat_10
    line_ent1.calculate_totals()

    line_ent2 = SubscriptionLine(
        subscription_id=sub_ent.id,
        product_id=storage_addon.id,
        quantity=4,
        unit_price=Decimal("25.00"),
        tax_rule_id=vat_10.id,
    )
    line_ent2.tax_rule = vat_10
    line_ent2.calculate_totals()

    db.add_all([line_ent1, line_ent2])
    db.flush()
    sub_ent.recalculate_totals()

    # 9. Invoices & Payments
    # Invoice 1: Small shop paid invoice
    inv_paid = Invoice(
        invoice_number="INV-2026-0001",
        customer_id=small_shop.id,
        subscription_id=sub_small.id,
        issue_date=now - timedelta(days=60),
        due_date=now - timedelta(days=30),
        billing_period_start=now - timedelta(days=60),
        billing_period_end=now - timedelta(days=30),
        status=InvoiceStatus.PAID,
    )
    db.add(inv_paid)
    db.flush()

    inv_paid_line = InvoiceLine(
        invoice_id=inv_paid.id,
        product_id=crm_prod.id,
        description="Brightloop CRM Starter Monthly",
        quantity=1,
        unit_price=Decimal("150.00"),
        tax_rule_id=sales_tax_8.id,
    )
    inv_paid_line.tax_rule = sales_tax_8
    inv_paid_line.calculate_totals()
    db.add(inv_paid_line)
    db.flush()
    inv_paid.recalculate_totals()

    pay1 = Payment(
        payment_number="PAY-2026-0001",
        invoice_id=inv_paid.id,
        amount=inv_paid.total_amount,
        payment_method="credit_card",
        reference_number="CH_STRIPE_12345",
        payment_date=now - timedelta(days=58),
    )
    db.add(pay1)
    inv_paid.record_payment(pay1.amount)

    # Invoice 2: Enterprise confirmed invoice (pending payment)
    inv_pending = Invoice(
        invoice_number="INV-2026-0002",
        customer_id=enterprise_client.id,
        subscription_id=sub_ent.id,
        issue_date=now - timedelta(days=15),
        due_date=now + timedelta(days=15),
        billing_period_start=now - timedelta(days=30),
        billing_period_end=now + timedelta(days=335),
        status=InvoiceStatus.CONFIRMED,
    )
    db.add(inv_pending)
    db.flush()

    inv_pend_line = InvoiceLine(
        invoice_id=inv_pending.id,
        product_id=crm_prod.id,
        variant_id=odoo_variant.id,
        description="Brightloop CRM (Odoo Brand) - 10 Seats Annual",
        quantity=10,
        unit_price=Decimal("1500.00"),
        tax_rule_id=vat_10.id,
    )
    inv_pend_line.tax_rule = vat_10
    inv_pend_line.calculate_totals()
    db.add(inv_pend_line)
    db.flush()
    inv_pending.recalculate_totals()

    db.commit()
    print("[SUCCESS] Seed data successfully committed to database!")


def main(target_engine: Optional[Engine] = None):
    active_engine = target_engine or default_engine
    print("Step 1: Initializing database tables...")
    init_db(active_engine)
    print("Step 2: Inserting seed records...")
    with get_db_context() as session:
        seed_database(session)


if __name__ == "__main__":
    main()

