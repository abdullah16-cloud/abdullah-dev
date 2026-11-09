-- ============================================================================
-- Honda Bikes Store — PostgreSQL Schema Definition
-- Database: PostgreSQL 13+
-- 
-- Description:
-- Creates core tables, integrity constraints, indexes, and triggers for
-- categories, products (bikes), users, orders, order items, and status history.
-- Wrapped in a transaction block so any failure leaves nothing half-created.
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- 1. UTILITY FUNCTIONS & TRIGGERS
-- ----------------------------------------------------------------------------

-- Reusable trigger function to automatically update the 'updated_at' timestamp
-- whenever a row is modified.
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ----------------------------------------------------------------------------
-- 2. CATEGORIES TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slug VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    badge_text VARCHAR(50),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER trg_categories_updated_at
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- ----------------------------------------------------------------------------
-- 3. PRODUCTS (MOTORCYCLE MODELS) TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    slug VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    engine_cc INTEGER,
    price_pkr NUMERIC(12, 2),
    colors JSONB NOT NULL DEFAULT '[]'::jsonb,
    specs JSONB NOT NULL DEFAULT '{}'::jsonb,
    images JSONB NOT NULL DEFAULT '[]'::jsonb,
    availability VARCHAR(30) NOT NULL DEFAULT 'unknown',
    is_verified BOOLEAN NOT NULL DEFAULT false,
    source_url TEXT,
    last_verified TIMESTAMPTZ,
    is_demo_data BOOLEAN NOT NULL DEFAULT true,
    featured BOOLEAN NOT NULL DEFAULT false,
    track_inventory BOOLEAN NOT NULL DEFAULT false,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_products_engine_cc CHECK (engine_cc IS NULL OR engine_cc > 0),
    CONSTRAINT chk_products_price_pkr CHECK (price_pkr IS NULL OR price_pkr >= 0.00),
    CONSTRAINT chk_products_stock_quantity CHECK (stock_quantity >= 0),
    CONSTRAINT chk_products_availability CHECK (
        availability IN ('in_stock', 'out_of_stock', 'coming_soon', 'unknown')
    )
);

CREATE TRIGGER trg_products_updated_at
BEFORE UPDATE ON products
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- Indexes for product discovery and filtering
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_availability ON products(availability);
CREATE INDEX IF NOT EXISTS idx_products_price_pkr ON products(price_pkr);

-- ----------------------------------------------------------------------------
-- 4. USERS (CUSTOMER & STAFF ACCOUNTS) TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'customer',
    city VARCHAR(100),
    shipping_address TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_users_email_format CHECK (
        email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ),
    CONSTRAINT chk_users_phone_pakistan CHECK (
        phone ~ '^03[0-9]{9}$'
    ),
    CONSTRAINT chk_users_role CHECK (
        role IN ('customer', 'admin', 'staff')
    )
);

CREATE TRIGGER trg_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- ----------------------------------------------------------------------------
-- 5. ORDERS (BIKE BOOKINGS & PURCHASES) TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    shipping_city VARCHAR(100) NOT NULL,
    shipping_address TEXT NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'cod',
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    subtotal_pkr NUMERIC(12, 2),
    delivery_fee_pkr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_pkr NUMERIC(12, 2),
    customer_notes TEXT,
    is_demo_data BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_orders_email_format CHECK (
        customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
    ),
    CONSTRAINT chk_orders_phone_pakistan CHECK (
        customer_phone ~ '^03[0-9]{9}$'
    ),
    CONSTRAINT chk_orders_status CHECK (
        status IN ('pending', 'confirmed', 'dispatched', 'delivered', 'cancelled')
    ),
    CONSTRAINT chk_orders_payment_method CHECK (
        payment_method IN ('cod', 'bank_transfer')
    ),
    CONSTRAINT chk_orders_subtotal_pkr CHECK (subtotal_pkr IS NULL OR subtotal_pkr >= 0.00),
    CONSTRAINT chk_orders_delivery_fee CHECK (delivery_fee_pkr >= 0.00),
    CONSTRAINT chk_orders_total_pkr CHECK (total_pkr IS NULL OR total_pkr >= 0.00)
);

CREATE TRIGGER trg_orders_updated_at
BEFORE UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ----------------------------------------------------------------------------
-- 6. ORDER_ITEMS (LINE ITEMS PER ORDER) TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id BIGINT REFERENCES products(id) ON DELETE RESTRICT,
    product_name VARCHAR(150) NOT NULL,
    product_slug VARCHAR(100) NOT NULL,
    selected_color VARCHAR(50),
    unit_price_pkr NUMERIC(12, 2),
    quantity INTEGER NOT NULL DEFAULT 1,
    line_total_pkr NUMERIC(12, 2),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_order_items_quantity CHECK (quantity > 0),
    CONSTRAINT chk_order_items_unit_price CHECK (unit_price_pkr IS NULL OR unit_price_pkr >= 0.00),
    CONSTRAINT chk_order_items_line_total CHECK (line_total_pkr IS NULL OR line_total_pkr >= 0.00)
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- ----------------------------------------------------------------------------
-- 7. ORDER_STATUS_HISTORY (AUDIT TRAIL) TABLE
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_status_history (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT chk_history_status CHECK (
        status IN ('pending', 'confirmed', 'dispatched', 'delivered', 'cancelled')
    )
);

CREATE INDEX IF NOT EXISTS idx_history_order_id ON order_status_history(order_id);

COMMIT;

