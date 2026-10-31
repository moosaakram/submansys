# Brightloop 360 - Subscription Management System

Brightloop 360 is a full-stack Subscription Management System built with Next.js for the frontend and PostgreSQL with SQLAlchemy 2.0 ORM for the backend database layer.

---

## 📁 Repository Structure

```text
├── database/               # Database models, connection, and initialization
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
├── src/                    # Next.js frontend application
├── public/                 # Static assets
├── .env.example            # Sample environment variables template
├── .gitignore              # Git ignore rules for Next.js and Python
├── package.json            # Node.js dependencies and scripts
├── requirements.txt        # Python dependencies (SQLAlchemy, psycopg2, etc.)
├── test_database.py        # Automated test and verification suite for database
└── README.md               # Main project documentation
```

---

## 💻 Frontend (Next.js)

### Getting Started

Install dependencies and start the development server:

```bash
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🗄️ Database Foundation (PostgreSQL + SQLAlchemy)

### 1. Install Python Dependencies

```bash
python -m venv .venv
# On Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and set your PostgreSQL credentials:

```bash
cp .env.example .env
```

Connection options in `.env`:
* **Option A**: Full URL: `DATABASE_URL=postgresql+psycopg2://postgres:yourpassword@localhost:5432/brightloop360`
* **Option B**: Individual variables (`DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_SSLMODE`)

### 3. Initialize Database Tables

Create the PostgreSQL database if not already created:
```sql
CREATE DATABASE brightloop360;
```

Run the table creation script:
```bash
python -m database.init_db
```

### 4. Running Database Tests

```bash
python test_database.py
```

---

## 🚀 Backend Developer Usage Guide

### Using Database Session in FastAPI Endpoints

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from database.models import Customer, Product, Subscription

router = APIRouter()

@router.get("/customers", response_model=list)
def list_customers(db: Session = Depends(get_db)):
    return db.query(Customer).all()
```

### Using Database Session in Background Tasks / Scripts

```python
from database import get_db_context
from database.models import Subscription, SubscriptionStatus

with get_db_context() as db:
    active_subs = db.query(Subscription).filter_by(status=SubscriptionStatus.ACTIVE).all()
    # Transaction commits automatically on exit
```

### Importing Models

```python
from database.models import (
    Customer,
    Product,
    Subscription,
    BillingCycle,
    SubscriptionStatus,
)
```
