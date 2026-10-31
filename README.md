# Brightloop 360 — Subscription Management System

[![Next.js](https://img.shields.io/badge/Next.js-15%2B-black?style=flat&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

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

**Brightloop 360** is a modern SaaS platform designed to manage the end-to-end lifecycle of recurring customer subscriptions. It unifies plan creation, billing automation, self-service customer authentication, lifecycle notifications, and business intelligence dashboards into an intuitive, cohesive ecosystem.

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

- [x] **Frontend Architecture Setup:** Clean Next.js project bootstrap with TypeScript compiler configurations and Tailwind CSS design tokens.
- [x] **Authentication UI Component (`LoginForm.tsx`):**
  - Modern, responsive SaaS login interface with Brightloop 360 blue/indigo branding.
  - Work email input with regular expression format validation.
  - Secure password field with interactive show/hide visibility toggle.
  - Controlled "Remember me" checkbox for device persistence state.
  - "Forgot password?" interaction hook with customizable callback.
  - Interactive submit button displaying an animated spinner during loading states.
  - Accessible, real-time client-side validation and contextual field error alerts.
  - Reusable TypeScript component interface (`LoginFormProps`) with modular callback handlers.

### Planned Features (Roadmap)

- [ ] **Backend Authentication Service:** JWT-based session handling, secure HTTP-only cookies, password hashing with Argon2/bcrypt, and OAuth2/SSO providers.
- [ ] **Role-Based Access Control (RBAC):** Distinct permissions for Super Admins, Account Managers, Finance Managers, and Subscribers.
- [ ] **Plan & Tier Management:** Interactive creation and editing of recurring billing tiers, trial days, feature flags, and add-on modules.
- [ ] **Payment Gateway Integration:** Secure transaction processing with Stripe, PayPal, and webhooks for payment confirmations.
- [ ] **Automated Invoicing & Dunning:** PDF invoice generation and automated email notification sequences for renewals and delinquent balances.
- [ ] **Subscription Analytics Dashboard:** Data visualizations for MRR, ARR, Net Retention Rate (NRR), churn cohorts, and plan distribution.
- [ ] **Subscriber Self-Service Portal:** Customer portal for updating billing methods, downloading invoices, and switching subscription tiers.

---

## 5. Technology Stack

### Frontend (Active)
- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **State Management:** React Hooks (`useState`, `useCallback`, `useId`)

### Backend (Planned)
- **Runtime:** [Node.js](https://nodejs.org/) (Express / NestJS) or [Python](https://www.python.org/) (FastAPI)
- **API Architecture:** RESTful JSON endpoints / GraphQL
- **Authentication:** JSON Web Tokens (JWT), OAuth 2.0

### Database & Persistence (Planned)
- **Database:** [PostgreSQL](https://www.postgresql.org/) (Relational engine for ACID-compliant financial transactions)
- **ORM / Query Builder:** [Prisma](https://www.prisma.io/) or [TypeORM](https://typeorm.io/)
- **Caching & Queues:** [Redis](https://redis.io/) (for session caching and scheduled webhook/billing queue jobs)

---

## 6. Project Folder Structure

```text
submansys/
├── README.md                      # Comprehensive project documentation
├── frontend/                      # Next.js frontend application
│   ├── app/                       # Next.js App Router root
│   │   ├── favicon.ico            # Application favicon
│   │   ├── globals.css            # Tailwind CSS styling and theme variables
│   │   ├── layout.tsx             # Root layout wrapper
│   │   └── page.tsx               # Root landing / dashboard entry
│   ├── components/                # Modular UI components
│   │   └── auth/                  # Authentication components
│   │       └── LoginForm.tsx      # Reusable Brightloop 360 login component
│   ├── public/                    # Static assets, logos, and images
│   ├── eslint.config.mjs          # Linting configuration
│   ├── next.config.ts             # Next.js framework configuration
│   ├── package.json               # Frontend dependencies and scripts
│   └── tsconfig.json              # TypeScript compiler configuration
├── backend/                       # Backend service directory (Planned / In Development)
│   ├── src/
│   │   ├── controllers/           # API request handlers
│   │   ├── middleware/            # Auth and validation middleware
│   │   ├── models/                # Database entities / schemas
│   │   ├── routes/                # API route definitions
│   │   └── services/              # Business logic (billing, subscription management)
│   ├── package.json
│   └── tsconfig.json
└── database/                      # Database scripts and migrations (Planned)
    ├── migrations/                # Schema version migrations
    ├── seeds/                     # Initial database seeding scripts
    └── schema.sql                 # SQL schema definitions
```

---

## 7. Installation & Prerequisites

### Prerequisites
Before running the project locally, ensure you have the following installed:
- **Node.js:** v18.18.0 or v20+ recommended (`node -v`)
- **npm:** v9+ or v10+ (`npm -v`)
- **Git:** Version control (`git -v`)

### Clone Repository

```bash
git clone https://github.com/moosaakram/submansys.git
cd submansys
```

---

## 8. Frontend Startup Instructions

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open your browser and navigate to:
   [http://localhost:3000](http://localhost:3000)

5. **Type check & build validation:**
   ```bash
   # Type check
   npx tsc --noEmit

   # Production build
   npm run build
   ```

---

## 9. Backend Startup Instructions

> [!NOTE]
> The backend service is currently in the architectural planning phase. Below are the designated startup steps once the backend workspace is committed:

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Configure environment variables:**
   Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
   Configure key variables:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL=postgresql://postgres:password@localhost:5432/brightloop360
   JWT_SECRET=your_secure_jwt_secret_key
   ```

3. **Install dependencies:**
   ```bash
   npm install
   ```

4. **Start the backend development server:**
   ```bash
   npm run dev
   ```
   The API will listen on `http://localhost:5000`.

---

## 10. Database Setup Instructions

> [!NOTE]
> Detailed schema definitions and migrations will be managed via Prisma / SQL scripts.

### Option A: Local Docker Container (Recommended)

1. **Run a PostgreSQL container:**
   ```bash
   docker run --name brightloop-db \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres \
     -e POSTGRES_DB=brightloop360 \
     -p 5432:5432 \
     -d postgres:16-alpine
   ```

2. **Run migrations (Once ORM schema is added):**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```

### Option B: Native PostgreSQL Installation

1. Create a database in your local PostgreSQL instance:
   ```sql
   CREATE DATABASE brightloop360;
   ```
2. Verify connection settings in `backend/.env` matching your PostgreSQL credentials.

---

## 11. Team Contributions

| Team Member | Role | Key Responsibilities | Component / Module |
| :--- | :--- | :--- | :--- |
| **Nihal** | Frontend & UI/UX Developer | Authentication UI component (`LoginForm.tsx`), client validation, responsive design, brand styling & core project documentation | `frontend/components/auth`, `README.md` |
| **Team Member 2** *(Placeholder)* | Backend & API Lead | REST API architecture, JWT authentication services, role-based authorization, and user service endpoints | `backend/src/controllers/auth`, `backend/src/routes` |
| **Team Member 3** *(Placeholder)* | Database & DevOps Specialist | Relational schema modeling (PostgreSQL/Prisma), migration pipelines, Docker containerization & CI/CD deployment | `database/`, Docker configurations |
| **Team Member 4** *(Placeholder)* | Business Logic & Billing Lead | Subscription lifecycle state machine, payment gateway integration (Stripe), dunning automation & analytics engine | `backend/src/services/billing`, `frontend/components/dashboard` |

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
