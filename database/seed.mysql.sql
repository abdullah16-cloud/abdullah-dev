-- ============================================================================
-- Honda Bikes Store — MySQL Reference & Initial Seed Data
-- Database: MySQL 8.0+ / MariaDB 10.4+
-- ============================================================================

-- 1. REFERENCE DATA: CATEGORIES
INSERT INTO categories (slug, title, description, badge_text, is_active)
VALUES
    ('commuter', 'Commuter', 'Fuel-efficient, reliable daily riders designed for daily urban navigation and work routes.', 'High Efficiency', 1),
    ('standard', 'Standard', 'Versatile motorcycles offering a balance of power, durability, and classic styling.', 'All-Rounder', 1),
    ('sport', 'Sport & Touring', 'Performance-oriented builds engineered for highway stability and sporty road presence.', 'Performance', 1)
ON DUPLICATE KEY UPDATE
    title = VALUES(title),
    description = VALUES(description),
    badge_text = VALUES(badge_text),
    is_active = VALUES(is_active);

-- 2. PRODUCTS SEED
-- CD 70
INSERT INTO products (
    category_id, slug, name, engine_cc, price_pkr, colors, specs, images, availability, is_verified, is_demo_data, featured, track_inventory, stock_quantity, is_active
)
SELECT id, 'honda-cd-70', 'Honda CD 70', NULL, NULL, '[]', '{}', '[]', 'unknown', 0, 1, 1, 0, 0, 1
FROM categories WHERE slug = 'commuter'
ON DUPLICATE KEY UPDATE name = VALUES(name), featured = VALUES(featured);

-- CD 70 Dream
INSERT INTO products (
    category_id, slug, name, engine_cc, price_pkr, colors, specs, images, availability, is_verified, is_demo_data, featured, track_inventory, stock_quantity, is_active
)
SELECT id, 'honda-cd-70-dream', 'Honda CD 70 Dream', NULL, NULL, '[]', '{}', '[]', 'unknown', 0, 1, 1, 0, 0, 1
FROM categories WHERE slug = 'commuter'
ON DUPLICATE KEY UPDATE name = VALUES(name), featured = VALUES(featured);

-- Pridor
INSERT INTO products (
    category_id, slug, name, engine_cc, price_pkr, colors, specs, images, availability, is_verified, is_demo_data, featured, track_inventory, stock_quantity, is_active
)
SELECT id, 'honda-pridor', 'Honda Pridor', NULL, NULL, '[]', '{}', '[]', 'unknown', 0, 1, 1, 0, 0, 1
FROM categories WHERE slug = 'commuter'
ON DUPLICATE KEY UPDATE name = VALUES(name), featured = VALUES(featured);

-- CG 125
INSERT INTO products (
    category_id, slug, name, engine_cc, price_pkr, colors, specs, images, availability, is_verified, is_demo_data, featured, track_inventory, stock_quantity, is_active
)
SELECT id, 'honda-cg-125', 'Honda CG 125', NULL, NULL, '[]', '{}', '[]', 'unknown', 0, 1, 1, 0, 0, 1
FROM categories WHERE slug = 'standard'
ON DUPLICATE KEY UPDATE name = VALUES(name), featured = VALUES(featured);

-- CG 125S
INSERT INTO products (
    category_id, slug, name, engine_cc, price_pkr, colors, specs, images, availability, is_verified, is_demo_data, featured, track_inventory, stock_quantity, is_active
)
SELECT id, 'honda-cg-125s', 'Honda CG 125S', NULL, NULL, '[]', '{}', '[]', 'unknown', 0, 1, 0, 0, 0, 1
FROM categories WHERE slug = 'standard'
ON DUPLICATE KEY UPDATE name = VALUES(name), featured = VALUES(featured);

-- CG 125S Gold
INSERT INTO products (
    category_id, slug, name, engine_cc, price_pkr, colors, specs, images, availability, is_verified, is_demo_data, featured, track_inventory, stock_quantity, is_active
)
SELECT id, 'honda-cg-125s-gold', 'Honda CG 125S Gold', NULL, NULL, '[]', '{}', '[]', 'unknown', 0, 1, 0, 0, 0, 1
FROM categories WHERE slug = 'standard'
ON DUPLICATE KEY UPDATE name = VALUES(name), featured = VALUES(featured);

-- CB 125F
INSERT INTO products (
    category_id, slug, name, engine_cc, price_pkr, colors, specs, images, availability, is_verified, is_demo_data, featured, track_inventory, stock_quantity, is_active
)
SELECT id, 'honda-cb-125f', 'Honda CB 125F', NULL, NULL, '[]', '{}', '[]', 'unknown', 0, 1, 0, 0, 0, 1
FROM categories WHERE slug = 'sport'
ON DUPLICATE KEY UPDATE name = VALUES(name), featured = VALUES(featured);

-- CB 150F
INSERT INTO products (
    category_id, slug, name, engine_cc, price_pkr, colors, specs, images, availability, is_verified, is_demo_data, featured, track_inventory, stock_quantity, is_active
)
SELECT id, 'honda-cb-150f', 'Honda CB 150F', NULL, NULL, '[]', '{}', '[]', 'unknown', 0, 1, 0, 0, 0, 1
FROM categories WHERE slug = 'sport'
ON DUPLICATE KEY UPDATE name = VALUES(name), featured = VALUES(featured);

-- CG 150
INSERT INTO products (
    category_id, slug, name, engine_cc, price_pkr, colors, specs, images, availability, is_verified, is_demo_data, featured, track_inventory, stock_quantity, is_active
)
SELECT id, 'honda-cg-150', 'Honda CG 150', NULL, NULL, '[]', '{}', '[]', 'unknown', 0, 1, 0, 0, 0, 1
FROM categories WHERE slug = 'sport'
ON DUPLICATE KEY UPDATE name = VALUES(name), featured = VALUES(featured);

