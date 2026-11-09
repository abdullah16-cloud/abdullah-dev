-- ============================================================================
-- Migration: 001_add_is_active_to_products_and_categories.sql
-- Database: PostgreSQL 13+
-- Description:
-- Adds 'is_active' boolean flag to 'products' and 'categories' tables to support
-- administrative soft deactivation/reactivation without hard deleting rows
-- referenced by orders.
--
-- Safety & Idempotency:
-- - Uses 'ADD COLUMN IF NOT EXISTS' so it can be re-run safely.
-- - Defaults to 'TRUE' so all existing records remain active.
-- - Adds a filtered/standard index on 'products.is_active' for catalog query performance.
-- - Entire migration is executed within a transaction block (BEGIN...COMMIT).
-- ============================================================================

BEGIN;

-- 1. Add is_active to categories
ALTER TABLE categories
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- 2. Add is_active to products
ALTER TABLE products
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- 3. Add index on products(is_active) to optimize public catalog filtering
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);

-- 4. Add index on categories(is_active)
CREATE INDEX IF NOT EXISTS idx_categories_is_active ON categories(is_active);

COMMIT;

