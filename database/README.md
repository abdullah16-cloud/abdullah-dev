# Honda Bikes Store — Database Setup & Guide

Welcome to the **Honda Bikes Store** database guide.  
This guide explains how our database architecture is organized, and how to create and manage the database with XAMPP MySQL.

---

## 1. Engine & Setup: XAMPP MySQL (Active)

The project connects to **MySQL / MariaDB** (standard on Windows via XAMPP):
- Default Port: `3306`
- Default User: `root` (empty password in local dev)
- Database Name: `honda_bikes_store`

### Quick Start via Backend Scripts:
1. Start MySQL in XAMPP Control Panel.
2. In terminal run:
   ```bash
   cd backend
   npm run db:seed
   ```
   *This automatically creates `honda_bikes_store`, creates tables from `schema.mysql.sql`, verifies columns (`is_active`), and populates 3 categories and 9 Honda bike models from `seed.mysql.sql`.*

---

## 2. Directory Structure

```text
database/
├── README.md                  # This guide
├── schema.mysql.sql           # Active MySQL table definitions, foreign keys & indexes
├── seed.mysql.sql             # Active MySQL reference data (categories) & 9 bike models
├── schema.sql                 # Reference PostgreSQL schema definition
├── seed.sql                   # Reference PostgreSQL seed data
├── migrations/
│   └── 001_add_is_active_to_products_and_categories.sql  # Safe migration script
├── tests/
│   └── constraints_test.sql   # Integrity rejection tests
└── scripts/
    └── reset_dev.sql          # DEV ONLY: Table cleanup script
```

---

## 3. Data Integrity & Security Policy

- **Zero Hardcoded Secrets:** No passwords or connection strings are hardcoded in source control.
- **No Fabricated Specifications:** Prices and engine capacities for unverified models remain strictly `NULL` with `is_demo_data = true` and `is_verified = false`.
- **Atomic Transactions:** Order creation and stock updates use database transactions to prevent race conditions or partial writes.
- **Consistent Enums & Booleans:** `is_active` flags allow administrative deactivation without breaking relational foreign keys to previous orders.
