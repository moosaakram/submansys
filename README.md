# Brightloop 360 — Subscription Management System

[![Next.js](https://img.shields.io/badge/Next.js-15%2B-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0-D71F00?style=flat&logo=sqlalchemy)](https://www.sqlalchemy.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)

An enterprise-grade, full-lifecycle Subscription Management System (SMS) designed to streamline recurring billing, customer entitlement tracking, revenue analytics, and lifecycle engagement for modern SaaS businesses.

---

## Table of Contents

- [1. Project Overview](#1-project-overview)
- [2. Problem Statement](#2-problem-statement)
- [3. Main Objectives](#3-main-objectives)
- [4. Features Status](#4-features-status)
  - [Implemented Features](#implemented-features-current)
  - [Planned Features (Roadmap)](#planned-features-roadmap)
- [5. Technology Stack](#5-technology-stack)
- [6. Project Folder Structure](#6-project-folder-structure)
- [7. Installation & Prerequisites](#7-installation--prerequisites)
- [8. Frontend Startup Instructions](#8-frontend-startup-instructions)
- [9. Backend Startup Instructions](#9-backend-startup-instructions)
- [10. Database Setup Instructions](#10-database-setup-instructions)
- [11. Team Contributions](#11-team-contributions)

---

## 1. Project Overview

**Brightloop 360** is a full-stack SaaS platform designed to manage the end-to-end lifecycle of recurring customer subscriptions. It unifies plan creation, billing automation, self-service customer authentication, lifecycle notifications, and business intelligence dashboards into an intuitive, cohesive ecosystem.

---

## 2. Problem Statement

Modern recurring revenue businesses encounter substantial operational friction as they scale:
- **Revenue Leakage & Involuntary Churn:** Failed payment attempts, expired cards, and missing dunning mechanisms lead to silent revenue loss.
- **Fragmented Subscription Data:** Customer tiers, upgrades, downgrades, and billing cycles are often dispersed across disparate systems without unified visibility.
- **Complex Billing Models:** Managing recurring intervals (monthly, annual, usage-based), coupons, prorations, and tax compliance requires significant engineering overhead.
- **Poor Customer Self-Service:** Subscribers frequently lack friction-free access to view invoices, update payment methods, or modify their service plans.

---

## 3. Main Objectives

1. **Centralized Subscription Control:** Provide an administrative hub to manage plans, pricing tiers, customer statuses, and trial periods.
2. **Automated Billing & Dunning:** Eliminate manual billing friction through scheduled recurring charges and automated retry logic for failed payments.
3. **Actionable Financial Analytics:** Deliver real-time reporting on Monthly Recurring Revenue (MRR), Annual Recurring Revenue (ARR), Churn Rate, and Customer Lifetime Value (LTV).
4. **Secure, Enterprise-Grade UI/UX:** Offer a responsive, brand-aligned web interface adhering to modern security standards, validation rules, and accessibility best practices.

---

## 4. Features Status

> [!NOTE]
> The table below clearly distinguishes between currently implemented modules and planned features scheduled on the product roadmap.

### Implemented Features (Current)

- [x] **Frontend Architecture Setup:** Clean Next.js project bootstrap with TypeScript compiler configurations and Tailwind CSS design tokens inside `frontend/`.
- [x] **Executive Dashboard UI (`frontend/src/components/dashboard/`):**
  - Metric cards for MRR, active subscribers, churn rate, and LTV.
  - Interactive plan distribution and recent activity modules.
  - Recent transactions table and dynamic sidebar navigation.
- [x] **Authentication & Registration UI Suite (`frontend/src/components/auth/`):**
  - **Login Form (`LoginForm.tsx` & `/login` page):** Email validation, show/hide password toggle, remember me checkbox, loading states, and error alerts.
  - **Customer Sign Up (`RegisterForm.tsx` & `/register` page):** Business account creation enforcing strict problem-statement criteria (>8 chars, uppercase, lowercase, special character) with live checklist.
  - **Password Reset (`ForgotPasswordForm.tsx` & `/forgot-password` page):** Self-service password reset dispatch interface.
- [x] **Customer Self-Service Portal (`frontend/src/components/portal/CustomerPortal.tsx` & `/portal` page):**
  - Personal subscription status view (rate, frequency, seats, renewal date, pause/resume toggle).
  - Automated invoice history table with tax calculations and PDF download triggers.
  - Default payment method management.
- [x] **Admin Staff Provisioning Modal (`frontend/src/components/admin/AddStaffModal.tsx`):**
  - Enforces rule that only admins can add limited-access internal staff (Sales, Billing, Support).
- [x] **Backend API Foundation (`backend/app/`):**
  - FastAPI application structure with CORS configuration for Next.js.
  - Health check endpoint (`/api/v1/health`), OpenAPI Swagger docs (`/docs`), and root info endpoint (`/`).
  - REST route modules for authentication, users, subscriptions, plans, products, invoices, payments, discounts, taxes, quotation templates, and analytics.
  - Structured global exception handlers for HTTP, validation, and internal errors.
- [x] **Database Schema & ORM Layer (`database/`):**
  - SQLAlchemy 2.0 declarative models for `Customer`, `Product`, `ProductVariant`, `Plan`, `Subscription`, `Invoice`, `Payment`, `Discount`, `Tax`, and `User`.
  - Comprehensive status and billing cycle enums (`ACTIVE`, `CANCELED`, `MONTHLY`, `ANNUAL`).
  - Connection pooling, error handling, session factory, and database initialization CLI.

### Planned Features (Roadmap)

- [ ] **Payment Gateway Live Processing:** Production Stripe / PayPal webhook listeners and live gateway charge capture.
- [ ] **Automated Invoicing & Dunning Dispatch:** Automated background cron job for PDF invoice generation and automated email notification sequences for failed renewals.
- [ ] **Live Dashboard Analytics:** Connect frontend dashboard charts directly to real-time database aggregate endpoints.

---

## 5. Technology Stack

### Frontend (Active)
- **Framework:** [Next.js](https://nextjs.org/) 15+ (App Router, Turbopack)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) v4
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** React Hooks (`useState`, `useCallback`, `useId`, `useMemo`), React Context

### Backend (Active)
- **Framework:** [FastAPI](https://fastapi.tiangolo.com/) (Python 3.10+)
- **Server:** [Uvicorn](https://www.uvicorn.org/) ASGI server
- **Validation:** [Pydantic](https://docs.pydantic.dev/) v2
- **Security:** Passlib (bcrypt), PyJWT

### Database & Persistence (Active)
- **Database:** [PostgreSQL](https://www.postgresql.org/) 16
- **ORM:** [SQLAlchemy](https://www.sqlalchemy.org/) 2.0 (Declarative Base, UUID/Timestamp mixins)
- **Driver:** `psycopg2-binary`

---

## 6. Project Folder Structure

```text
submansys/
├── README.md                      # Comprehensive project documentation
├── package.json                   # Root workspace configuration
├── requirements.txt               # Root Python dependencies
├── test_database.py               # Database verification test suite
├── frontend/                      # Next.js frontend application
│   ├── src/                       # Application source code
│   │   ├── app/                   # App Router pages and layouts
│   │   │   ├── favicon.ico        # Favicon
│   │   │   ├── globals.css        # Global Tailwind CSS definitions
│   │   │   ├── layout.tsx         # Root dashboard layout
│   │   │   ├── page.tsx           # Main dashboard view
│   │   │   ├── login/page.tsx     # Dedicated Login route
│   │   │   ├── register/page.tsx  # Dedicated Sign Up route
│   │   │   ├── forgot-password/page.tsx # Password reset route
│   │   │   └── portal/page.tsx    # Customer self-service portal route
│   │   ├── components/            # Reusable UI components
│   │   │   ├── auth/              # Authentication & onboarding UI
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   └── ForgotPasswordForm.tsx
│   │   │   ├── portal/            # Customer self-service portal
│   │   │   │   └── CustomerPortal.tsx
│   │   │   ├── admin/             # Admin exclusive tools
│   │   │   │   └── AddStaffModal.tsx
│   │   │   ├── dashboard/         # Executive dashboard components
│   │   │   ├── analytics/         # Financial & MRR analytics
│   │   │   ├── subscriptions/     # Subscriptions lifecycle management
│   │   │   ├── invoices/          # Automated billing & invoices
│   │   │   ├── payments/          # Payment recording & reconciliation
│   │   │   ├── plans/             # Subscription plans configuration
│   │   │   └── products/          # Product catalog & variants
│   │   ├── context/               # Global state contexts
│   │   ├── data/                  # Mock and seed data
│   │   └── types/                 # TypeScript type declarations
│   ├── package.json               # Frontend dependencies & scripts
│   ├── tsconfig.json              # TypeScript compiler configuration
│   ├── next.config.ts             # Next.js configuration
│   └── eslint.config.mjs          # Linting rules
├── backend/                       # FastAPI backend application
│   ├── app/
│   │   ├── core/                  # Security, config, database session
│   │   ├── routes/                # REST API routes (auth, plans, invoices, etc.)
│   │   ├── schemas/               # Pydantic request/response schemas
│   │   ├── services/              # Business logic
│   │   └── main.py                # FastAPI entry point
│   ├── requirements.txt
│   └── .env.example
└── database/                      # SQLAlchemy 2.0 database models & connection
    ├── models/                    # Customer, Product, Subscription, Invoice models
    ├── connection.py              # Engine configuration & session management
    ├── base.py                    # Declarative base & mixins
    └── init_db.py                 # Table creation script
```

---

## 7. Installation & Prerequisites

### Prerequisites
Before running the project locally, ensure you have the following installed:
- **Node.js:** v18.18.0 or v20+ (`node -v`)
- **Python:** v3.10+ (`python --version`)
- **PostgreSQL:** Local service or Docker (`docker -v`)
- **Git:** Version control (`git -v`)

### Clone Repository

```bash
git clone https://github.com/moosaakram/submansys.git
cd submansys
```

---

## 8. Frontend Startup Instructions

1. **Install project dependencies:**
   ```bash
   npm install
   # or
   npm install --prefix frontend
   ```

2. **Start the local development server:**
   ```bash
   npm run dev
   ```

3. **Access the application routes:**
   - **Executive Dashboard:** [http://localhost:3000](http://localhost:3000)
   - **Customer Portal:** [http://localhost:3000/portal](http://localhost:3000/portal)
   - **Sign In:** [http://localhost:3000/login](http://localhost:3000/login)
   - **Business Sign Up:** [http://localhost:3000/register](http://localhost:3000/register)
   - **Forgot Password:** [http://localhost:3000/forgot-password](http://localhost:3000/forgot-password)

4. **Type check & build validation:**
   ```bash
   npm run build
   ```

---

## 9. Backend Startup Instructions

1. **Set up Python Virtual Environment:**
   ```bash
   python -m venv .venv

   # Activate virtual environment
   # On Windows PowerShell:
   .\.venv\Scripts\Activate.ps1
   # On Linux/macOS:
   source .venv/bin/activate
   ```

2. **Install backend dependencies:**
   ```bash
   pip install -r backend/requirements.txt
   # or from root
   pip install -r requirements.txt
   ```

3. **Configure environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   ```

4. **Start the FastAPI backend server:**
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   Interactive Swagger documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 10. Database Setup Instructions

### 1. Configure PostgreSQL Connection

Create the PostgreSQL database if not already created:
```sql
CREATE DATABASE brightloop360;
```

Configure `.env` in the project root:
```env
DATABASE_URL=postgresql+psycopg2://postgres:yourpassword@localhost:5432/brightloop360
```

### 2. Initialize Database Tables

Run the table initialization script:
```bash
python -m database.init_db
`

### 3. Seed Realistic Test Data (Brightloop Business Scenarios)

Populate admin/staff users, Odoo brand variants, plans, quotations, multi-line subscriptions, invoices, and payments:
`ash
python -m database.seed_data
```

### 3. Verify Database Setup

Run the automated test suite to verify models and connections:
```bash
python test_database.py
```

---

## 11. Team Contributions

| Team Member | Role | Key Responsibilities | Component / Module |
| :--- | :--- | :--- | :--- |
| **Nihal** | Frontend & UI/UX Developer | Authentication UI suite (`LoginForm`, `RegisterForm`, `ForgotPasswordForm`), Customer Self-Service Portal (`CustomerPortal`), Admin Staff Provisioning (`AddStaffModal`), App Router routes, and core project documentation | `frontend/src/components/auth`, `frontend/src/components/portal`, `frontend/src/components/admin`, `frontend/src/app/{login,register,forgot-password,portal}`, `README.md` |
| **Moosa** | Frontend Lead & Architect | Executive dashboard layout, navigation sidebar, top navbar, metric cards, and frontend build setup | `frontend/src/components/dashboard`, `frontend/src/app` |
| **Hrithu** | Backend Developer | FastAPI application setup, CORS middleware, health endpoints, Pydantic schemas, and error handlers | `backend/app/` |
| **Rishy** | Database Engineer | PostgreSQL integration, SQLAlchemy 2.0 ORM models (`Customer`, `Product`, `Subscription`), and test verification suite | `database/`, `test_database.py` |

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
