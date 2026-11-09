-- ============================================================================
-- Honda Bikes Store — Reference & Initial Seed Data
-- Database: PostgreSQL 13+
--
-- DATA INTEGRITY POLICY (CRITICAL):
-- 1. No prices, engine specs, colors, or inventory counts are fabricated.
-- 2. All motorcycle models seeded below are derived strictly from
--    frontend/src/data/bikes.js and frontend/src/data/categories.js.
-- 3. In keeping with our transparency guarantee, price_pkr and engine_cc are
--    seeded as NULL with is_verified = false and is_demo_data = true.
-- 4. No fake users, no fake customer orders, no fake reviews, and no default
--    admin passwords are seeded.
-- 5. This script is idempotent and safe to run multiple times using ON CONFLICT.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. REFERENCE DATA: CATEGORIES
-- ----------------------------------------------------------------------------
INSERT INTO categories (slug, title, description, badge_text)
VALUES
    (
        'commuter',
        'Commuter',
        'Fuel-efficient, reliable daily riders designed for daily urban navigation and work routes.',
        'High Efficiency'
    ),
    (
        'standard',
        'Standard',
        'Versatile motorcycles offering a balance of power, durability, and classic styling.',
        'All-Rounder'
    ),
    (
        'sport',
        'Sport & Touring',
        'Performance-oriented builds engineered for highway stability and sporty road presence.',
        'Performance'
    )
ON CONFLICT (slug) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    badge_text = EXCLUDED.badge_text,
    updated_at = CURRENT_TIMESTAMP;

-- ----------------------------------------------------------------------------
-- 2. MOTORCYCLE CATALOG DATA (UNVERIFIED DEMO MODELS)
-- ----------------------------------------------------------------------------
-- Note: Subqueries are used to dynamically resolve category_id from category slug.

-- 1. Honda CD 70 (Commuter, Featured)
INSERT INTO products (
    category_id,
    slug,
    name,
    engine_cc,
    price_pkr,
    colors,
    specs,
    images,
    availability,
    is_verified,
    source_url,
    last_verified,
    is_demo_data,
    featured,
    track_inventory,
    stock_quantity
)
VALUES (
    (SELECT id FROM categories WHERE slug = 'commuter'),
    'honda-cd-70',
    'Honda CD 70',
    NULL,
    NULL,
    '[]'::jsonb,
    '{}'::jsonb,
    '[]'::jsonb,
    'unknown',
    false,
    NULL,
    NULL,
    true,
    true,
    false,
    0
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    featured = EXCLUDED.featured,
    updated_at = CURRENT_TIMESTAMP;

-- 2. Honda CD 70 Dream (Commuter, Featured)
INSERT INTO products (
    category_id,
    slug,
    name,
    engine_cc,
    price_pkr,
    colors,
    specs,
    images,
    availability,
    is_verified,
    source_url,
    last_verified,
    is_demo_data,
    featured,
    track_inventory,
    stock_quantity
)
VALUES (
    (SELECT id FROM categories WHERE slug = 'commuter'),
    'honda-cd-70-dream',
    'Honda CD 70 Dream',
    NULL,
    NULL,
    '[]'::jsonb,
    '{}'::jsonb,
    '[]'::jsonb,
    'unknown',
    false,
    NULL,
    NULL,
    true,
    true,
    false,
    0
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    featured = EXCLUDED.featured,
    updated_at = CURRENT_TIMESTAMP;

-- 3. Honda Pridor (Commuter, Featured)
INSERT INTO products (
    category_id,
    slug,
    name,
    engine_cc,
    price_pkr,
    colors,
    specs,
    images,
    availability,
    is_verified,
    source_url,
    last_verified,
    is_demo_data,
    featured,
    track_inventory,
    stock_quantity
)
VALUES (
    (SELECT id FROM categories WHERE slug = 'commuter'),
    'honda-pridor',
    'Honda Pridor',
    NULL,
    NULL,
    '[]'::jsonb,
    '{}'::jsonb,
    '[]'::jsonb,
    'unknown',
    false,
    NULL,
    NULL,
    true,
    true,
    false,
    0
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    featured = EXCLUDED.featured,
    updated_at = CURRENT_TIMESTAMP;

-- 4. Honda CG 125 (Standard, Featured)
INSERT INTO products (
    category_id,
    slug,
    name,
    engine_cc,
    price_pkr,
    colors,
    specs,
    images,
    availability,
    is_verified,
    source_url,
    last_verified,
    is_demo_data,
    featured,
    track_inventory,
    stock_quantity
)
VALUES (
    (SELECT id FROM categories WHERE slug = 'standard'),
    'honda-cg-125',
    'Honda CG 125',
    NULL,
    NULL,
    '[]'::jsonb,
    '{}'::jsonb,
    '[]'::jsonb,
    'unknown',
    false,
    NULL,
    NULL,
    true,
    true,
    false,
    0
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    featured = EXCLUDED.featured,
    updated_at = CURRENT_TIMESTAMP;

-- 5. Honda CG 125S (Standard, Non-Featured)
INSERT INTO products (
    category_id,
    slug,
    name,
    engine_cc,
    price_pkr,
    colors,
    specs,
    images,
    availability,
    is_verified,
    source_url,
    last_verified,
    is_demo_data,
    featured,
    track_inventory,
    stock_quantity
)
VALUES (
    (SELECT id FROM categories WHERE slug = 'standard'),
    'honda-cg-125s',
    'Honda CG 125S',
    NULL,
    NULL,
    '[]'::jsonb,
    '{}'::jsonb,
    '[]'::jsonb,
    'unknown',
    false,
    NULL,
    NULL,
    true,
    false,
    false,
    0
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    featured = EXCLUDED.featured,
    updated_at = CURRENT_TIMESTAMP;

-- 6. Honda CG 125S Gold (Standard, Non-Featured)
INSERT INTO products (
    category_id,
    slug,
    name,
    engine_cc,
    price_pkr,
    colors,
    specs,
    images,
    availability,
    is_verified,
    source_url,
    last_verified,
    is_demo_data,
    featured,
    track_inventory,
    stock_quantity
)
VALUES (
    (SELECT id FROM categories WHERE slug = 'standard'),
    'honda-cg-125s-gold',
    'Honda CG 125S Gold',
    NULL,
    NULL,
    '[]'::jsonb,
    '{}'::jsonb,
    '[]'::jsonb,
    'unknown',
    false,
    NULL,
    NULL,
    true,
    false,
    false,
    0
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    featured = EXCLUDED.featured,
    updated_at = CURRENT_TIMESTAMP;

-- 7. Honda CB 125F (Sport & Touring, Non-Featured)
INSERT INTO products (
    category_id,
    slug,
    name,
    engine_cc,
    price_pkr,
    colors,
    specs,
    images,
    availability,
    is_verified,
    source_url,
    last_verified,
    is_demo_data,
    featured,
    track_inventory,
    stock_quantity
)
VALUES (
    (SELECT id FROM categories WHERE slug = 'sport'),
    'honda-cb-125f',
    'Honda CB 125F',
    NULL,
    NULL,
    '[]'::jsonb,
    '{}'::jsonb,
    '[]'::jsonb,
    'unknown',
    false,
    NULL,
    NULL,
    true,
    false,
    false,
    0
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    featured = EXCLUDED.featured,
    updated_at = CURRENT_TIMESTAMP;

-- 8. Honda CB 150F (Sport & Touring, Non-Featured)
INSERT INTO products (
    category_id,
    slug,
    name,
    engine_cc,
    price_pkr,
    colors,
    specs,
    images,
    availability,
    is_verified,
    source_url,
    last_verified,
    is_demo_data,
    featured,
    track_inventory,
    stock_quantity
)
VALUES (
    (SELECT id FROM categories WHERE slug = 'sport'),
    'honda-cb-150f',
    'Honda CB 150F',
    NULL,
    NULL,
    '[]'::jsonb,
    '{}'::jsonb,
    '[]'::jsonb,
    'unknown',
    false,
    NULL,
    NULL,
    true,
    false,
    false,
    0
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    featured = EXCLUDED.featured,
    updated_at = CURRENT_TIMESTAMP;

-- 9. Honda CG 150 (Sport & Touring, Non-Featured)
INSERT INTO products (
    category_id,
    slug,
    name,
    engine_cc,
    price_pkr,
    colors,
    specs,
    images,
    availability,
    is_verified,
    source_url,
    last_verified,
    is_demo_data,
    featured,
    track_inventory,
    stock_quantity
)
VALUES (
    (SELECT id FROM categories WHERE slug = 'sport'),
    'honda-cg-150',
    'Honda CG 150',
    NULL,
    NULL,
    '[]'::jsonb,
    '{}'::jsonb,
    '[]'::jsonb,
    'unknown',
    false,
    NULL,
    NULL,
    true,
    false,
    false,
    0
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    featured = EXCLUDED.featured,
    updated_at = CURRENT_TIMESTAMP;

COMMIT;

