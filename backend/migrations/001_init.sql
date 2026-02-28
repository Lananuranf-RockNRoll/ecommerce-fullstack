-- migrations/001_init.sql

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(100)        NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255)        NOT NULL,
    role        VARCHAR(20)         NOT NULL DEFAULT 'user',
    created_at  TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS products (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        VARCHAR(255)   NOT NULL,
    description TEXT,
    price       DECIMAL(12, 2) NOT NULL,
    stock       INTEGER        NOT NULL DEFAULT 0,
    image_url   TEXT,
    category    VARCHAR(100)   NOT NULL,
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id     UUID           NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    status      VARCHAR(50)    NOT NULL DEFAULT 'pending',
    total_price DECIMAL(12, 2) NOT NULL,
    created_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
    id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id   UUID           NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
    product_id UUID           NOT NULL REFERENCES products (id),
    quantity   INTEGER        NOT NULL,
    price      DECIMAL(12, 2) NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_products_category ON products (category);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders (user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items (order_id);

-- Seed data
INSERT INTO users (id, name, email, password, role)
VALUES ('00000000-0000-0000-0000-000000000001',
        'Admin',
        'admin@ecommerce.com',
        -- password: admin123
        '$2a$10$rK6hZ5VGCsX5y9qHxBt8w.9Wt2O3VZjY7VxHJ8tDEd3xNnIUx4HO6',
        'admin')
ON CONFLICT DO NOTHING;

INSERT INTO products (name, description, price, stock, image_url, category) VALUES
('Laptop Pro X', 'High-performance laptop for professionals', 1299.99, 50, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', 'Electronics'),
('Wireless Headphones', 'Premium noise-cancelling headphones', 299.99, 100, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 'Electronics'),
('Mechanical Keyboard', 'RGB mechanical keyboard with tactile switches', 149.99, 75, 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=400', 'Electronics'),
('Running Shoes', 'Lightweight performance running shoes', 89.99, 200, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'Sports'),
('Yoga Mat', 'Non-slip premium yoga mat', 49.99, 150, 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400', 'Sports'),
('Coffee Maker', 'Programmable 12-cup coffee maker', 79.99, 80, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400', 'Home'),
('Desk Lamp', 'LED desk lamp with adjustable brightness', 39.99, 120, 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400', 'Home'),
('Backpack', 'Waterproof travel backpack 40L', 69.99, 90, 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400', 'Fashion');
