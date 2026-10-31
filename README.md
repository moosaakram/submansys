# Brightloop 360 - Database Foundation

This repository contains the database foundation and core ORM models for **Brightloop 360**, a Subscription Management System built with PostgreSQL, Python, and SQLAlchemy 2.0 ORM.

---

## 📁 Project Structure

```text
├── database/
│   ├── __init__.py         # Package exports (engine, sessions, models, helpers)
│   ├── init.py             # Re-exports for init.py imports
│   ├── base.py             # Declarative Base, UUID, and Timestamp mixins
│   ├── connection.py       # Engine config, connection pooling, get_db, error handling
│   ├── init_db.py          # Table creation CLI script
│   └── models/
│       ├── __init__.py     # Exports all models and enums
│       ├── init.py         # Specification re-export module
│       ├── customer.py     # Customer entity model
│       ├── product.py      # Product / Plan entity model
│       └── subscription.py # Subscription entity model & enums
├── .env.example            # Sample environment variables template
├── .gitignore              # Git ignore rules for Python & venv
├── requirements.txt        # Python dependencies
├── test_database.py        # Automated test and verification suite
└── README.md               # Documentation & usage guide
```

---

## ⚙️ Setup & Configuration

### 1. Install Dependencies

Create and activate a virtual environment, then install requirements:

```bash
python -m venv .venv
# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and adjust the PostgreSQL credentials:

```bash
cp .env.example .env
```

You can configure either a complete connection string or discrete variables:

#### Option A: Connection URL
```ini
DATABASE_URL=postgresql+psycopg2://postgres:yourpassword@localhost:5432/brightloop360
```

#### Option B: Discrete Parameters
```ini
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_HOST=localhost
DB_PORT=5432
DB_NAME=brightloop360
DB_SSLMODE=prefer
```

---

## 🗄️ Database Creation & Initialization

### Step 1: Create the Database in PostgreSQL

Connect to your PostgreSQL server via `psql` or `pgAdmin` and create the database:

```sql
CREATE DATABASE brightloop360;
```

### Step 2: Initialize Tables

Run the table creation CLI script:

```bash
python -m database.init_db
```

This verifies PostgreSQL connectivity and creates all tables:
* `customers`
* `products`
* `subscriptions`

---

## 🚀 Backend Developer Usage Guide

### 1. Using Database Session in FastAPI Endpoints

The `get_db` generator is designed for FastAPI dependency injection:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from database.models import Customer, Product, Subscription

router = APIRouter()

@router.get("/customers", response_model=list)
def list_customers(db: Session = Depends(get_db)):
    customers = db.query(Customer).all()
    return customers

@router.post("/customers", status_code=status.HTTP_201_CREATED)
def create_customer(full_name: str, email: str, db: Session = Depends(get_db)):
    existing = db.query(Customer).filter_by(email=email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    new_customer = Customer(full_name=full_name, email=email)
    db.add(new_customer)
    db.commit()
    db.refresh(new_customer)
    return new_customer
```

### 2. Using Database Session in Background Tasks / Scripts

Use `get_db_context()` for automated transaction management (`commit` on success, `rollback` on error):

```python
from database import get_db_context
from database.models import Subscription, SubscriptionStatus

def cancel_expired_subscriptions():
    with get_db_context() as db:
        expired = db.query(Subscription).filter(
            Subscription.status == SubscriptionStatus.ACTIVE,
            Subscription.expiry_date != None
        ).all()
        
        for sub in expired:
            sub.status = SubscriptionStatus.CLOSED
        # Automatically commits when exiting the with block
```

### 3. Importing Models

All models and enums are exported directly from `database.models` (or `database.models.init`):

```python
from database.models import (
    Customer,
    Product,
    Subscription,
    BillingCycle,
    SubscriptionStatus,
)
```

### 4. Working with Relationships

```python
from decimal import Decimal
from datetime import datetime, timezone
from database import get_db_context
from database.models import Customer, Product, Subscription, BillingCycle, SubscriptionStatus

with get_db_context() as db:
    # 1. Create a customer
    customer = Customer(
        full_name="Acme Global",
        email="billing@acme.com",
        company_name="Acme Inc."
    )
    db.add(customer)

    # 2. Create a product
    product = Product(
        name="Enterprise SaaS Suite",
        product_type="recurring",
        sales_price=Decimal("199.00"),
        cost_price=Decimal("30.00"),
        is_active=True
    )
    db.add(product)
    db.flush()

    # 3. Create a subscription linking customer and product
    sub = Subscription(
        customer_id=customer.id,
        product_id=product.id,
        subscription_number="SUB-2026-0001",
        billing_cycle=BillingCycle.MONTHLY,
        quantity=10,
        unit_price=Decimal("199.00"),
        start_date=datetime.now(timezone.utc),
        status=SubscriptionStatus.ACTIVE
    )
    db.add(sub)
    db.commit()

    # Direct relationship access
    print(customer.subscriptions[0].product.name)  # "Enterprise SaaS Suite"
    print(product.subscriptions[0].customer.full_name)  # "Acme Global"
```

---

## 🧪 Testing and Verification

Run the verification suite:

```bash
python test_database.py
```

This verifies:
1. SQLAlchemy metadata registration.
2. All column names, constraints, unique indexes, and foreign keys.
3. In-memory ORM operations, object instantiation, and relationships.
4. Connection error handling and diagnostics against PostgreSQL.

