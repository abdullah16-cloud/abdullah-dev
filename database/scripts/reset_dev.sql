-- ============================================================================
-- Honda Bikes Store — Development Database Reset Script
-- Database: PostgreSQL 13+
--
-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
-- WARNING: DESTRUCTIVE ACTION (DEVELOPMENT & TESTING ONLY)
-- NEVER EXECUTE THIS SCRIPT ON STAGING OR PRODUCTION DATABASES!
-- This script completely DROPS all store tables, constraints, triggers, and
-- functions, erasing all data permanently.
-- !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
-- ============================================================================

BEGIN;

-- Drop dependent tables in reverse order of foreign key relationships
DROP TABLE IF EXISTS order_status_history CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Drop utility trigger function
DROP FUNCTION IF EXISTS set_updated_at() CASCADE;

COMMIT;

-- Notice to developer
DO $$
BEGIN
    RAISE NOTICE '=======================================================';
    RAISE NOTICE 'Development database tables dropped successfully.';
    RAISE NOTICE 'Run schema.sql followed by seed.sql to recreate tables.';
    RAISE NOTICE '=======================================================';
END;
$$;

