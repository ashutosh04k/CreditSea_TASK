# Loan Management System (LMS)

A full-stack digital lending platform built with **Next.js (App Router)**, **Express.js**, **TypeScript**, **MongoDB**, **JWT Authentication**, and **Role-Based Access Control (RBAC)**.

---

## 🌟 Features Overview

### 1. Borrower Portal (`/borrower`)
- **Step 1: Sign Up / Login**: Passwords securely hashed with `bcrypt`. Protected JWT routes.
- **Step 2: Personal Details & Server-Side BRE Check**:
  - **Age Validation**: Must be between 23 and 50 years.
  - **Salary Check**: Minimum ₹25,000 / month.
  - **PAN Format Validation**: Strict Indian PAN regex (`^[A-Z]{5}[0-9]{4}[A-Z]{1}$`).
  - **Employment Check**: Rejects `Unemployed` applicants with clear error feedback.
- **Step 3: Salary Slip Upload**: Supports PDF/JPG/PNG files up to 5 MB with drag-and-drop support.
- **Step 4: Loan Configurator & Live Math**:
  - Sliders for Loan Amount (₹50,000 – ₹5,00,000) and Tenure (30 – 365 days).
  - Fixed 12% p.a. interest calculation using Simple Interest:
    $$SI = \frac{P \times R \times T}{365 \times 100}$$
  - Creates loan in **`APPLIED`** status.
- **Application Tracker**: Real-time lifecycle visual tracker (`APPLIED` → `SANCTIONED` → `DISBURSED` → `CLOSED` / `REJECTED`).

---

### 2. Operations Dashboard (`/dashboard`)
Guard-protected by **Role-Based Access Control (RBAC)** on both frontend and backend:
- **Sales Module** (`Sales`, `Admin`): Tracks registered pre-application leads.
- **Sanction Module** (`Sanction`, `Admin`): Reviews `APPLIED` loans, inspects salary slip documents, Approves (`SANCTIONED`) or Rejects (`REJECTED` with custom reason).
- **Disbursement Module** (`Disbursement`, `Admin`): Executes fund releases for `SANCTIONED` loans, marking them `DISBURSED`.
- **Collection Module** (`Collection`, `Admin`): Records payments with unique **UTR numbers** (enforces duplicate check). Auto-closes loan when total payments equal total repayment (`CLOSED`).
- **Admin View**: Accesses all 4 modules seamlessly with aggregated analytics.

---

## 🔐 Pre-Seeded Test Credentials

Clicking **"Seed Demo DB"** in the top navigation bar or running `npm run seed` in `backend/` creates the following test accounts (Password for all accounts: `Password123!`):

| Role | Email | Password | Module Access |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@lms.com` | `Password123!` | All Dashboard Modules + Stats |
| **Sales** | `sales@lms.com` | `Password123!` | Sales Module Only |
| **Sanction** | `sanction@lms.com` | `Password123!` | Sanction Module Only |
| **Disbursement** | `disburse@lms.com` | `Password123!` | Disbursement Module Only |
| **Collection** | `collect@lms.com` | `Password123!` | Collection Module Only |
| **Borrower** | `borrower@lms.com` | `Password123!` | Borrower Application Portal Only |

> 💡 *On the `/login` screen, click any of the 1-Click Role cards to instantly auto-fill credentials.*

---

## 🚀 Quick Start & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017/lms_db` or a remote MongoDB Atlas URI)

### 1. Setup Backend
```bash
cd backend
npm install
npm run seed     # Pre-populates default accounts for all 6 roles
npm run dev      # Starts Express API at http://localhost:5001
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev      # Starts Next.js app at http://localhost:3000
```

---

## 📂 Repository Structure

```
Slw/
├── backend/                # Express + TypeScript API Server
│   ├── src/
│   │   ├── config/         # MongoDB Database Connection
│   │   ├── middleware/     # JWT Auth & RBAC Middleware
│   │   ├── models/         # Mongoose User, Loan, Payment Schemas
│   │   ├── routes/         # Auth, Borrower, and Dashboard Routes
│   │   ├── services/       # Business Rule Engine (BRE) & Loan Math
│   │   ├── seed/           # Role Account Seeder Script
│   │   └── server.ts       # Express Entry Point
│   └── uploads/            # Salary slip files storage
│
└── frontend/               # Next.js 14 App Router + Tailwind CSS
    ├── src/
    │   ├── app/            # App Router (/login, /register, /borrower, /dashboard)
    │   ├── components/     # Navbar, Modals, Sliders, Module views
    │   ├── context/        # React Auth Context & JWT Token Manager
    │   ├── services/       # Axios API client
    │   └── types/          # TypeScript interfaces
    └── tailwind.config.js
```

---

## 🧪 Verification & Testing Flow

1. **Borrower Flow**:
   - Log in as `borrower@lms.com` (or create a new Borrower).
   - Enter Personal Details with BRE pass (or fail deliberately by picking Age < 23 or `Unemployed`).
   - Upload Salary Slip file.
   - Configure Loan Amount (e.g. ₹1,00,000) and Tenure (180 Days) -> Click **Apply**. Loan created as `APPLIED`.

2. **Sanction Flow**:
   - Log in as `sanction@lms.com`.
   - View loan in Sanction module -> Click **Review & Decision** -> Click **Approve & Sanction**. Status becomes `SANCTIONED`.

3. **Disbursement Flow**:
   - Log in as `disburse@lms.com`.
   - View loan in Disbursement module -> Click **Disburse Funds**. Status becomes `DISBURSED`.

4. **Collection & Auto-Close Flow**:
   - Log in as `collect@lms.com`.
   - View active disbursed loan -> Click **+ Record Payment**.
   - Input UTR `UTR987654321` and repayment amount equal to Total Repayment.
   - Status automatically transitions to **`CLOSED`**!
# CreditSea_TASK
