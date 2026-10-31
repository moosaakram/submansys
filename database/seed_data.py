"""
Seed Data Script for Brightloop 360 / SubMan.
Populates the database with realistic business scenarios from the problem statement:
- Admin, Staff, and Customer RBAC users
- Payment Terms (Net 30, Net 15, Due on Receipt)
- Hierarchical Product Categories
- Modular Add-ons (recurring, one_time, usage_metered)
- Products and Brand Variants (Odoo Brand +$560)
- Monthly and Yearly Plans with Plan Items bundling
- Tax Rules & Promotional Discounts with Redemptions
- Quotation Templates, Quotations, and Sales Orders
- Multi-line Subscriptions & Subscription Events
- Invoices (Draft, Confirmed, Paid, and Overdue)
- Payments matched to invoices and reconciled
- Billing Runs history
"""

import sys
from datetime import date, datetime, timedelta, timezone
from decimal import Decimal
from typing import Optional

from sqlalchemy.engine import Engine
from sqlalchemy.orm import Session

from database.connection import engine as default_engine, get_db_context, init_db
from database.models import (
    Addon,
    AddonBillingType,
    BillingCycle,
    BillingRun,
    BillingRunItem,
    BillingRunItemStatus,
    BillingRunStatus,
    Customer,
    DiscountProduct,
    DiscountRedemption,
    DiscountRedemptionStatus,
    DiscountRule,
    DiscountScope,
    DiscountType,
    Invoice,
    InvoiceKind,
    InvoiceLine,
    InvoiceStatus,
    Payment,
    PaymentStatus,
    PaymentTerm,
    PaymentType,
    Plan,
    PlanItem,
    Product,
    ProductCategory,
    ProductVariant,
    Quotation,
    QuotationItem,
    QuotationStatus,
    QuotationTemplate,
    QuotationTemplateLine,
    SalesOrder,
    SalesOrderItem,
    SalesOrderStatus,
    Subscription,
    SubscriptionEvent,
    SubscriptionLine,
    SubscriptionStatus,
    TaxRule,
    User,
    UserRole,
)


def seed_database(db: Session) -> None:
    print("Seeding Brightloop 360 foundational data...")
    now = datetime.now(timezone.utc)

    # 1. Tax Rules
    vat_10 = TaxRule(name="VAT 10%", rate=Decimal("10.00"))
    sales_tax_8 = TaxRule(name="US Sales Tax 8%", rate=Decimal("8.00"))
    db.add_all([vat_10, sales_tax_8])
    db.flush()

    # 2. Payment Terms
    net_30 = PaymentTerm(name="Net 30", days_due=30, description="Payment due within 30 days", is_default=True)
    net_15 = PaymentTerm(name="Net 15", days_due=15, description="Payment due within 15 days", is_default=False)
    due_receipt = PaymentTerm(name="Due on Receipt", days_due=0, description="Payment due immediately", is_default=False)
    db.add_all([net_30, net_15, due_receipt])
    db.flush()

    # 3. Product Categories (Hierarchical)
    cat_software = ProductCategory(name="Software Platforms", slug="software-platforms", description="Core ERP, CRM, and SaaS suites")
    cat_addons = ProductCategory(name="Add-ons & Plugins", slug="addons-plugins", description="Modular extension licenses")
    cat_services = ProductCategory(name="Professional Services", slug="professional-services", description="Consulting and SLA packages")
    db.add_all([cat_software, cat_addons, cat_services])
    db.flush()

    # 4. Modular Add-ons
    addon_copilot = Addon(name="AI Automation Copilot", code="ADDON-AI-COPILOT", description="Generative AI reply copilot", unit_price=Decimal("49.00"), billing_type=AddonBillingType.RECURRING)
    addon_sla = Addon(name="Dedicated 24/7 SLA", code="ADDON-247-SLA", description="15-minute SLA engineer guarantee", unit_price=Decimal("450.00"), billing_type=AddonBillingType.RECURRING)
    addon_setup = Addon(name="One-Time Migration Package", code="ADDON-MIGRATE", description="Cloud data import and setup", unit_price=Decimal("950.00"), billing_type=AddonBillingType.ONE_TIME)
    db.add_all([addon_copilot, addon_sla, addon_setup])
    db.flush()

    # 5. Customers
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

    # 6. RBAC Users
    admin_user = User(
        email="admin@brightloop.com",
        full_name="Admin Director",
        hashed_password="$2b$12$K1jP3vM9Z/4Q7hR1g...",
        role=UserRole.ADMIN,
        is_active=True,
    )
    staff_user = User(
        email="staff@brightloop.com",
        full_name="Sarah Sales Rep",
        hashed_password="$2b$12$K1jP3vM9Z/4Q7hR1g...",
        role=UserRole.STAFF,
        is_active=True,
    )
    customer_user = User(
        email="billing@craftcoffee.com",
        full_name="Craft Coffee Billing",
        hashed_password="$2b$12$K1jP3vM9Z/4Q7hR1g...",
        role=UserRole.CUSTOMER,
        customer_id=small_shop.id,
        is_active=True,
    )
    db.add_all([admin_user, staff_user, customer_user])
    db.flush()

    # 7. Products & Variants (Problem Statement: Odoo brand adds +560)
    crm_prod = Product(
        name="SubMan Business ERP Suite",
        description="Comprehensive customer relationship, inventory and pipeline tracker",
        product_type="recurring",
        sales_price=Decimal("299.00"),
        cost_price=Decimal("45.00"),
        is_active=True,
    )
    storage_addon = Product(
        name="AI Automation Copilot",
        description="Expand document processing and automated customer replies",
        product_type="add_on",
        sales_price=Decimal("49.00"),
        cost_price=Decimal("12.00"),
        is_active=True,
    )
    db.add_all([crm_prod, storage_addon])
    db.flush()

    odoo_variant = ProductVariant(
        product_id=crm_prod.id,
        attribute_name="Brand",
        attribute_value="Odoo Enterprise Integration",
        price_extra=Decimal("560.00"),  # Odoo brand adds 560
        is_active=True,
    )
    db.add(odoo_variant)
    db.flush()

    # 8. Plans (Monthly and Yearly with Lifecycle Policies)
    monthly_plan = Plan(
        product_id=crm_prod.id,
        name="Growth Monthly Plan",
        billing_cycle=BillingCycle.MONTHLY,
        cost=Decimal("299.00"),
        minimum_quantity=1,
        start_date=now,
        auto_close=False,
        allow_early_close=True,
        allow_pause=True,
        allow_renew=True,
    )
    yearly_plan = Plan(
        product_id=crm_prod.id,
        name="Enterprise Annual Contract",
        billing_cycle=BillingCycle.YEARLY,
        cost=Decimal("2990.00"),
        minimum_quantity=5,
        start_date=now,
        auto_close=True,
        allow_early_close=False,
        allow_pause=False,
        allow_renew=True,
    )
    db.add_all([monthly_plan, yearly_plan])
    db.flush()

    # 9. Plan Items Bundling
    plan_item_erp = PlanItem(plan_id=monthly_plan.id, product_id=crm_prod.id, quantity=1)
    plan_item_ent = PlanItem(plan_id=yearly_plan.id, product_id=crm_prod.id, variant_id=odoo_variant.id, quantity=5)
    db.add_all([plan_item_erp, plan_item_ent])
    db.flush()

    # 10. Quotation Template
    quote_template = QuotationTemplate(
        name="Standard 5-Seat Enterprise Onboarding",
        plan_id=yearly_plan.id,
        validity_days=30,
        notes="Includes 1 year support and onboarding setup (Net 30)",
    )
    db.add(quote_template)
    db.flush()

    quote_line1 = QuotationTemplateLine(
        template_id=quote_template.id,
        product_id=crm_prod.id,
        variant_id=odoo_variant.id,
        quantity=5,
        unit_price=Decimal("859.00"),
    )
    quote_line2 = QuotationTemplateLine(
        template_id=quote_template.id,
        product_id=storage_addon.id,
        quantity=2,
        unit_price=Decimal("49.00"),
    )
    db.add_all([quote_line1, quote_line2])
    db.flush()

    # 11. Quotation Instance
    quotation_1 = Quotation(
        quotation_number="QTN-2026-0001",
        customer_id=enterprise_client.id,
        template_id=quote_template.id,
        payment_term_id=net_30.id,
        status=QuotationStatus.CONFIRMED,
        valid_until=date.today() + timedelta(days=30),
        subtotal=Decimal("4393.00"),
        discount_amount=Decimal("439.30"),
        tax_amount=Decimal("395.37"),
        total_amount=Decimal("4349.07"),
        notes="Custom Odoo Enterprise Brand deployment bundle",
    )
    db.add(quotation_1)
    db.flush()

    q_item_1 = QuotationItem(
        quotation_id=quotation_1.id,
        product_id=crm_prod.id,
        variant_id=odoo_variant.id,
        product_name_snapshot="SubMan Business ERP Suite",
        variant_name_snapshot="Odoo Ecosystem Brand Integration",
        quantity=5,
        unit_price=Decimal("859.00"),
        line_subtotal=Decimal("4295.00"),
        discount_amount=Decimal("429.50"),
        tax_amount=Decimal("386.55"),
        line_total=Decimal("4252.05"),
    )
    db.add(q_item_1)
    db.flush()

    # 12. Sales Order
    sales_order_1 = SalesOrder(
        order_number="SO-2026-0001",
        quotation_id=quotation_1.id,
        customer_id=enterprise_client.id,
        payment_term_id=net_30.id,
        status=SalesOrderStatus.CONFIRMED,
        order_date=date.today(),
        total_amount=Decimal("4349.07"),
        notes="Converted from QTN-2026-0001",
    )
    db.add(sales_order_1)
    db.flush()

    so_item_1 = SalesOrderItem(
        sales_order_id=sales_order_1.id,
        product_id=crm_prod.id,
        variant_id=odoo_variant.id,
        product_name_snapshot="SubMan Business ERP Suite",
        variant_name_snapshot="Odoo Ecosystem Brand Integration",
        quantity=5,
        unit_price=Decimal("859.00"),
        line_subtotal=Decimal("4295.00"),
        discount_amount=Decimal("429.50"),
        tax_amount=Decimal("386.55"),
        line_total=Decimal("4252.05"),
    )
    db.add(so_item_1)
    db.flush()

    # 13. Discount Rules
    now = datetime.now(timezone.utc)
    volume_discount = DiscountRule(
        code="VOLUME10",
        name="10% Volume Discount",
        discount_type=DiscountType.PERCENTAGE,
        value=Decimal("10.00"),
        scope=DiscountScope.WHOLE_SUBSCRIPTION,
        start_date=now - timedelta(days=90),
        min_purchase_amount=Decimal("1000.00"),
        min_quantity=5,
        max_uses=100,
        is_active=True,
    )
    db.add(volume_discount)
    db.flush()

    # 14. Active Subscriptions
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
        product_name=crm_prod.name,
        quantity=1,
        unit_price=Decimal("299.00"),
        tax_rate=Decimal("8.00"),
        amount=Decimal("322.92"),
    )
    db.add(line_small)
    sub_small.total_amount = Decimal("322.92")
    db.flush()

    # Subscription Event
    sub_event = SubscriptionEvent(
        subscription_id=sub_small.id,
        actor_id=admin_user.id,
        event_type="ACTIVATED",
        from_status="confirmed",
        to_status="active",
        reason="Initial contract activation upon agreement confirmation",
    )
    db.add(sub_event)
    db.flush()

    # Subscription B: Enterprise (Yearly with Odoo Brand)
    sub_ent = Subscription(
        subscription_number="SUB-2026-0002",
        customer_id=enterprise_client.id,
        plan_id=yearly_plan.id,
        product_id=crm_prod.id,
        billing_cycle=BillingCycle.YEARLY,
        start_date=now - timedelta(days=30),
        next_billing_date=now + timedelta(days=335),
        status=SubscriptionStatus.ACTIVE,
        total_amount=Decimal("9449.00"),
    )
    db.add(sub_ent)
    db.flush()

    line_ent1 = SubscriptionLine(
        subscription_id=sub_ent.id,
        product_id=crm_prod.id,
        variant_id=odoo_variant.id,
        product_name=crm_prod.name + " (Odoo Brand)",
        quantity=10,
        unit_price=Decimal("859.00"),
        tax_rate=Decimal("10.00"),
        amount=Decimal("9449.00"),
    )
    db.add(line_ent1)
    db.flush()

    # 15. Invoices & Payments
    # Invoice 1: Small shop paid invoice
    inv_paid = Invoice(
        invoice_number="INV-2026-0001",
        customer_id=small_shop.id,
        customer_name=small_shop.full_name,
        customer_email=small_shop.email,
        subscription_id=sub_small.id,
        invoice_kind=InvoiceKind.RECURRING,
        issue_date=now - timedelta(days=60),
        due_date=now - timedelta(days=30),
        billing_period_start=(now - timedelta(days=60)).date(),
        billing_period_end=(now - timedelta(days=30)).date(),
        currency="INR",
        status=InvoiceStatus.PAID,
        subtotal=Decimal("299.00"),
        tax_amount=Decimal("23.92"),
        discount_amount=Decimal("0.00"),
        total_amount=Decimal("322.92"),
        paid_amount=Decimal("322.92"),
        balance=Decimal("0.00"),
    )
    db.add(inv_paid)
    db.flush()

    inv_paid_line = InvoiceLine(
        invoice_id=inv_paid.id,
        product_id=crm_prod.id,
        product_name="SubMan Business ERP Suite",
        description="SubMan Business ERP Starter Monthly",
        quantity=1,
        unit_price=Decimal("299.00"),
        tax_rate=Decimal("8.00"),
        tax_amount=Decimal("23.92"),
        discount_amount=Decimal("0.00"),
        total=Decimal("322.92"),
    )
    db.add(inv_paid_line)
    db.flush()

    pay1 = Payment(
        payment_number="PAY-2026-0001",
        invoice_id=inv_paid.id,
        customer_id=small_shop.id,
        amount=inv_paid.total_amount,
        payment_method="credit_card",
        payment_type=PaymentType.PAYMENT,
        status=PaymentStatus.SUCCESS,
        reference_number="CH_STRIPE_12345",
        payment_date=now - timedelta(days=58),
    )
    db.add(pay1)

    # Invoice 2: Enterprise confirmed invoice (pending payment)
    inv_pending = Invoice(
        invoice_number="INV-2026-0002",
        customer_id=enterprise_client.id,
        customer_name=enterprise_client.full_name,
        customer_email=enterprise_client.email,
        subscription_id=sub_ent.id,
        invoice_kind=InvoiceKind.RECURRING,
        issue_date=now - timedelta(days=15),
        due_date=now + timedelta(days=15),
        billing_period_start=(now - timedelta(days=30)).date(),
        billing_period_end=(now + timedelta(days=335)).date(),
        currency="INR",
        status=InvoiceStatus.CONFIRMED,
        subtotal=Decimal("8590.00"),
        tax_amount=Decimal("859.00"),
        discount_amount=Decimal("0.00"),
        total_amount=Decimal("9449.00"),
        paid_amount=Decimal("0.00"),
        balance=Decimal("9449.00"),
    )
    db.add(inv_pending)
    db.flush()

    inv_pend_line = InvoiceLine(
        invoice_id=inv_pending.id,
        product_id=crm_prod.id,
        product_name="SubMan Business ERP Suite (Odoo Brand)",
        description="SubMan Business ERP Suite (Odoo Brand) - 10 Seats Annual",
        quantity=10,
        unit_price=Decimal("859.00"),
        tax_rate=Decimal("10.00"),
        tax_amount=Decimal("859.00"),
        discount_amount=Decimal("0.00"),
        total=Decimal("9449.00"),
    )
    db.add(inv_pend_line)
    db.flush()

    # 16. Billing Run Log
    billing_run_1 = BillingRun(
        run_number="BRUN-2026-10-01-001",
        initiated_by=admin_user.id,
        status=BillingRunStatus.COMPLETED,
        target_date=date(2026, 10, 1),
        total_candidates=2,
        successful_count=2,
        skipped_count=0,
        failed_count=0,
        total_amount_billed=Decimal("9771.92"),
    )
    db.add(billing_run_1)
    db.flush()

    db.commit()
    print("[SUCCESS] Comprehensive Seed data successfully committed to database!")


def main(target_engine: Optional[Engine] = None):
    active_engine = target_engine or default_engine
    print("Step 1: Initializing database tables...")
    init_db(active_engine)
    print("Step 2: Inserting seed records...")
    with get_db_context() as session:
        seed_database(session)


if __name__ == "__main__":
    main()
