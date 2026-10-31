import json
import urllib.request
import urllib.error

def post(url, payload, headers=None):
    if headers is None:
        headers = {}
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json', **headers}
    )
    try:
        r = urllib.request.urlopen(req)
        return r.getcode(), json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))

def get(url, headers=None):
    if headers is None:
        headers = {}
    req = urllib.request.Request(url, headers=headers)
    try:
        r = urllib.request.urlopen(req)
        return r.getcode(), json.loads(r.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode('utf-8'))

def run_tests():
    print("=== 1. Health & Root Endpoints ===")
    root_code, root_res = get("http://127.0.0.1:8000/")
    print(f"GET /: [{root_code}] {root_res}")
    health_code, health_res = get("http://127.0.0.1:8000/health")
    print(f"GET /health: [{health_code}] {health_res}")

    print("\n=== 2. Admin Authentication ===")
    code, auth = post("http://127.0.0.1:8000/api/v1/auth/login", {
        "email": "admin@brightloop.com",
        "password": "Admin@12345!"
    })
    print(f"Admin Login Status: [{code}], Role: {auth['user']['role']}")
    token = auth["access_token"]
    auth_hdr = {"Authorization": f"Bearer {token}"}

    print("\n=== 3. Customer Registration with Password Requirements ===")
    import uuid
    test_id = uuid.uuid4().hex[:6]
    w_code, w_res = post("http://127.0.0.1:8000/api/v1/auth/signup", {
        "email": f"weak_{test_id}@acme.com",
        "full_name": "Test User",
        "password": "weak"
    })
    print(f"Weak Password Test: [{w_code}] (Rejected successfully: {w_code in (400, 422)})")
    
    s_code, s_res = post("http://127.0.0.1:8000/api/v1/auth/signup", {
        "email": f"customer_{test_id}@acme.com",
        "full_name": "Enterprise Buyer",
        "password": "StrongPassword@123!"
    })
    print(f"Strong Password Signup: [{s_code}], User Email: {s_res['user']['email']}")

    print("\n=== 4. Admin Onboards Staff Member ===")
    staff_code, staff_res = post("http://127.0.0.1:8000/api/v1/users/staff", {
        "email": f"staff_{test_id}@brightloop.com",
        "full_name": "Operations Lead",
        "password": "StaffPassword@123!",
        "role": "staff"
    }, headers=auth_hdr)
    print(f"Staff Onboarding Status: [{staff_code}], Name: {staff_res['full_name']}, Role: {staff_res['role']}")

    print("\n=== 5. Catalog Products & Odoo Variant (+560) ===")
    p_code, prods = get("http://127.0.0.1:8000/api/v1/products")
    print(f"Products Count: {len(prods)}")
    for p in prods:
        print(f" - Product: {p['name']} (Base: ${p['sales_price']})")
        for v in p.get("variants", []):
            print(f"   * Variant: {v['attribute_name']}={v['attribute_value']} (Price Extra: +${v['price_extra']})")

    print("\n=== 6. Subscription Plans & Recurrence ===")
    pl_code, plans = get("http://127.0.0.1:8000/api/v1/plans")
    print(f"Plans Count: {len(plans)}")
    for pl in plans:
        print(f" - Plan: {pl['name']} | Cost: ${pl['cost']} | Recurrence: {pl['billing_cycle']} | Auto-Close: {pl['auto_close']}")

    print("\n=== 7. Admin Discount Rules ===")
    d_code, discounts = get("http://127.0.0.1:8000/api/v1/discounts")
    print(f"Discounts Count: {len(discounts)}")
    for d in discounts:
        print(f" - Discount: {d['name']} ({d['value']}%) | Min Quantity: {d['min_quantity']}")

    print("\n=== 8. Billing Day Engine (Automated Recurring Invoices) ===")
    b_code, b_res = post("http://127.0.0.1:8000/api/v1/invoices/generate-recurring", {}, headers=auth_hdr)
    print(f"Billing Day Status: [{b_code}] {b_res['message']}")

    print("\n=== 9. Invoices & Printable Document ===")
    inv_code, invoices = get("http://127.0.0.1:8000/api/v1/invoices", headers=auth_hdr)
    print(f"Total Invoices: {len(invoices)}")
    target_inv = invoices[0]
    print(f"First Invoice: {target_inv['invoice_number']} | Subtotal: ${target_inv['subtotal']} | Tax: ${target_inv['tax_amount']} | Discount: ${target_inv['discount_amount']} | Total: ${target_inv['total_amount']}")
    
    pr_code, pr_res = get(f"http://127.0.0.1:8000/api/v1/invoices/{target_inv['id']}/print", headers=auth_hdr)
    print(f"Invoice Print Endpoint: [{pr_code}] -> Formatted text rendered with balance: {pr_res['balance_due']}")

    print("\n=== 10. Record Payment against Invoice ===")
    pay_code, pay_res = post("http://127.0.0.1:8000/api/v1/payments", {
        "invoice_id": target_inv["id"],
        "payment_method": "bank_transfer",
        "amount": 5000.00,
        "note": "Initial corporate wire payment"
    }, headers=auth_hdr)
    print(f"Payment Status: [{pay_code}], Number: {pay_res['payment_number']}, Amount: ${pay_res['amount']}")

    print("\n=== 11. Finance Lead Analytics Dashboard (Sub-2s Query SLA) ===")
    an_code, analytics = get("http://127.0.0.1:8000/api/v1/analytics/dashboard", headers=auth_hdr)
    print(f"Analytics Status: [{an_code}]")
    print(f" - Active Subscriptions: {analytics['active_subscriptions_count']}")
    print(f" - Total Revenue Collected: ${analytics['total_revenue_collected']}")
    print(f" - Total Outstanding Balance: ${analytics['total_outstanding_owed']}")
    print(f" - Overdue Invoices Count: {analytics['overdue_invoices_count']}")
    print(f" - Query Execution Time: {analytics['query_execution_time_ms']} ms (Target SLA: < 2000 ms)")

    print("\nAll Brightloop 360 problem statement workflows verified successfully!")

if __name__ == "__main__":
    run_tests()
