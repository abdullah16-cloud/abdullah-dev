-- ============================================================================
-- Honda Bikes Store — Database Constraints & Integrity Test Suite
-- Database: PostgreSQL 13+
--
-- Description:
-- Verifies that integrity constraints strictly REJECT invalid, malformed,
-- or out-of-bounds data.
-- 
-- Each test is executed inside a PL/pgSQL block with exception handling.
-- The entire file is enclosed in a transaction that always ends with ROLLBACK,
-- ensuring that no test data persists.
-- ============================================================================

BEGIN;

DO $$
DECLARE
    dummy_cat_id BIGINT;
    dummy_prod_id BIGINT;
    dummy_order_id BIGINT;
    failed_test_count INTEGER := 0;
BEGIN
    RAISE NOTICE '==================================================';
    RAISE NOTICE 'Starting Constraints & Integrity Verification Suite';
    RAISE NOTICE '==================================================';

    -- Setup minimal fixture data for testing child references
    INSERT INTO categories (slug, title) 
    VALUES ('test-commuter', 'Test Commuter') 
    RETURNING id INTO dummy_cat_id;

    INSERT INTO products (category_id, slug, name)
    VALUES (dummy_cat_id, 'test-bike-model', 'Test Bike Model')
    RETURNING id INTO dummy_prod_id;

    INSERT INTO orders (
        order_number, customer_name, customer_email, customer_phone, shipping_city, shipping_address
    )
    VALUES (
        'TEST-ORD-001', 'Test Customer', 'customer@example.com', '03001234567', 'Lahore', 'Test Street 1'
    )
    RETURNING id INTO dummy_order_id;

    -- ------------------------------------------------------------------------
    -- TEST 1: Reject negative price on product
    -- ------------------------------------------------------------------------
    BEGIN
        INSERT INTO products (category_id, slug, name, price_pkr)
        VALUES (dummy_cat_id, 'test-neg-price', 'Negative Price Bike', -1500.00);

        RAISE EXCEPTION 'TEST 1 FAILED: Negative price was accepted.';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'TEST 1 PASSED: Negative price correctly rejected by chk_products_price_pkr.';
    END;

    -- ------------------------------------------------------------------------
    -- TEST 2: Reject invalid product availability
    -- ------------------------------------------------------------------------
    BEGIN
        INSERT INTO products (category_id, slug, name, availability)
        VALUES (dummy_cat_id, 'test-bad-avail', 'Bad Avail Bike', 'available_now');

        RAISE EXCEPTION 'TEST 2 FAILED: Invalid availability status was accepted.';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'TEST 2 PASSED: Invalid availability status rejected by chk_products_availability.';
    END;

    -- ------------------------------------------------------------------------
    -- TEST 3: Reject duplicate product slug
    -- ------------------------------------------------------------------------
    BEGIN
        INSERT INTO products (category_id, slug, name)
        VALUES (dummy_cat_id, 'test-bike-model', 'Duplicate Bike Model');

        RAISE EXCEPTION 'TEST 3 FAILED: Duplicate product slug was accepted.';
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE 'TEST 3 PASSED: Duplicate product slug rejected by unique constraint.';
    END;

    -- ------------------------------------------------------------------------
    -- TEST 4: Reject invalid Pakistani phone number format
    -- ------------------------------------------------------------------------
    BEGIN
        INSERT INTO users (full_name, email, phone, password_hash)
        VALUES ('Test User', 'test.phone@example.com', '04212345678', 'dummy_hash_for_testing_only');

        RAISE EXCEPTION 'TEST 4 FAILED: Non-Pakistani / non-03 phone format was accepted.';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'TEST 4 PASSED: Invalid phone format rejected by chk_users_phone_pakistan.';
    END;

    -- ------------------------------------------------------------------------
    -- TEST 5: Reject invalid email format
    -- ------------------------------------------------------------------------
    BEGIN
        INSERT INTO users (full_name, email, phone, password_hash)
        VALUES ('Test User', 'not-a-valid-email-format', '03009999999', 'dummy_hash_for_testing_only');

        RAISE EXCEPTION 'TEST 5 FAILED: Malformed email was accepted.';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'TEST 5 PASSED: Malformed email rejected by chk_users_email_format.';
    END;

    -- ------------------------------------------------------------------------
    -- TEST 6: Reject invalid order status
    -- ------------------------------------------------------------------------
    BEGIN
        INSERT INTO orders (
            order_number, customer_name, customer_email, customer_phone, shipping_city, shipping_address, status
        )
        VALUES (
            'TEST-ORD-002', 'Test Customer', 'user@example.com', '03001234567', 'Karachi', 'Road 2', 'flying'
        );

        RAISE EXCEPTION 'TEST 6 FAILED: Invalid order status was accepted.';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'TEST 6 PASSED: Invalid order status rejected by chk_orders_status.';
    END;

    -- ------------------------------------------------------------------------
    -- TEST 7: Reject zero or negative order item quantity
    -- ------------------------------------------------------------------------
    BEGIN
        INSERT INTO order_items (order_id, product_name, product_slug, quantity)
        VALUES (dummy_order_id, 'Test Bike', 'test-bike', 0);

        RAISE EXCEPTION 'TEST 7 FAILED: Zero quantity in order item was accepted.';
    EXCEPTION WHEN check_violation THEN
        RAISE NOTICE 'TEST 7 PASSED: Zero quantity rejected by chk_order_items_quantity.';
    END;

    -- ------------------------------------------------------------------------
    -- TEST 8: Reject foreign key orphan in products
    -- ------------------------------------------------------------------------
    BEGIN
        INSERT INTO products (category_id, slug, name)
        VALUES (999999, 'orphan-bike', 'Orphan Bike');

        RAISE EXCEPTION 'TEST 8 FAILED: Non-existent category_id was accepted.';
    EXCEPTION WHEN foreign_key_violation THEN
        RAISE NOTICE 'TEST 8 PASSED: Orphan foreign key rejected by fk constraint.';
    END;

    RAISE NOTICE '==================================================';
    RAISE NOTICE 'All integrity & constraint tests passed successfully!';
    RAISE NOTICE '==================================================';
END;
$$;

-- Always rollback to keep test environment clean
ROLLBACK;

