-- Migration: Multitenant support
-- Adds businesses table and business_id to all data tables
-- Safe to run on existing data: existing records will be assigned to a default business

-- 1. Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(120),
  phone VARCHAR(30),
  address TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Insert default business for existing data
INSERT INTO businesses (id, name, email, status)
VALUES (1, 'Negocio Principal', 'admin@inventario.local', 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. Add business_id to users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'business_id'
  ) THEN
    ALTER TABLE users ADD COLUMN business_id INT REFERENCES businesses(id);
    UPDATE users SET business_id = 1;
    ALTER TABLE users ALTER COLUMN business_id SET NOT NULL;
  END IF;
END
$$;

-- 4. Add business_id to categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'business_id'
  ) THEN
    ALTER TABLE categories ADD COLUMN business_id INT REFERENCES businesses(id);
    UPDATE categories SET business_id = 1;
    ALTER TABLE categories ALTER COLUMN business_id SET NOT NULL;
  END IF;
END
$$;

-- 5. Add business_id to products
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'business_id'
  ) THEN
    ALTER TABLE products ADD COLUMN business_id INT REFERENCES businesses(id);
    UPDATE products SET business_id = 1;
    ALTER TABLE products ALTER COLUMN business_id SET NOT NULL;
  END IF;
END
$$;

-- 6. Add business_id to suppliers
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'suppliers' AND column_name = 'business_id'
  ) THEN
    ALTER TABLE suppliers ADD COLUMN business_id INT REFERENCES businesses(id);
    UPDATE suppliers SET business_id = 1;
    ALTER TABLE suppliers ALTER COLUMN business_id SET NOT NULL;
  END IF;
END
$$;

-- 7. Add business_id to sales
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales' AND column_name = 'business_id'
  ) THEN
    ALTER TABLE sales ADD COLUMN business_id INT REFERENCES businesses(id);
    UPDATE sales SET business_id = 1;
    ALTER TABLE sales ALTER COLUMN business_id SET NOT NULL;
  END IF;
END
$$;

-- 8. Add business_id to purchases
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'purchases' AND column_name = 'business_id'
  ) THEN
    ALTER TABLE purchases ADD COLUMN business_id INT REFERENCES businesses(id);
    UPDATE purchases SET business_id = 1;
    ALTER TABLE purchases ALTER COLUMN business_id SET NOT NULL;
  END IF;
END
$$;

-- 9. Add business_id to inventory_movements
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'inventory_movements' AND column_name = 'business_id'
  ) THEN
    ALTER TABLE inventory_movements ADD COLUMN business_id INT REFERENCES businesses(id);
    UPDATE inventory_movements SET business_id = 1;
    ALTER TABLE inventory_movements ALTER COLUMN business_id SET NOT NULL;
  END IF;
END
$$;

-- 10. Add business_id to recipes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'recipes' AND column_name = 'business_id'
  ) THEN
    ALTER TABLE recipes ADD COLUMN business_id INT REFERENCES businesses(id);
    UPDATE recipes SET business_id = 1;
    ALTER TABLE recipes ALTER COLUMN business_id SET NOT NULL;
  END IF;
END
$$;

-- 11. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_business_id ON users(business_id);
CREATE INDEX IF NOT EXISTS idx_categories_business_id ON categories(business_id);
CREATE INDEX IF NOT EXISTS idx_products_business_id ON products(business_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_business_id ON suppliers(business_id);
CREATE INDEX IF NOT EXISTS idx_sales_business_id ON sales(business_id);
CREATE INDEX IF NOT EXISTS idx_purchases_business_id ON purchases(business_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_business_id ON inventory_movements(business_id);
CREATE INDEX IF NOT EXISTS idx_recipes_business_id ON recipes(business_id);
