-- Script de actualización de BD
-- Ejecuta: psql -U postgres.wltzmponhdrmtylmxxiu -h aws-1-us-east-1.pooler.supabase.com -d postgres -f update_db.sql

-- Nota: Si necesitas limpiar completamente, descomentar:
-- DROP SCHEMA public CASCADE;
-- CREATE SCHEMA public;

-- Crear índices (si la BD ya existe)
-- Primero verificar que exista la extensión pg_trgm
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Índices para optimizar búsquedas y ordenamientos (si las tablas existen)
DO $$
BEGIN
  -- Verificar si la tabla products existe
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'products') THEN
    CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(name gin_trgm_ops);
    CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);
    CREATE INDEX IF NOT EXISTS idx_products_stock_alert ON products(stock_current, stock_minimum);
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sales') THEN
    CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date DESC);
    CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
    CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON sales(payment_method);
    CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'purchases') THEN
    CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(purchase_date DESC);
    CREATE INDEX IF NOT EXISTS idx_purchases_supplier_id ON purchases(supplier_id);
    CREATE INDEX IF NOT EXISTS idx_purchases_user_id ON purchases(user_id);
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'sale_details') THEN
    CREATE INDEX IF NOT EXISTS idx_sale_details_sale_id ON sale_details(sale_id);
    CREATE INDEX IF NOT EXISTS idx_sale_details_product_id ON sale_details(product_id);
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'purchase_details') THEN
    CREATE INDEX IF NOT EXISTS idx_purchase_details_purchase_id ON purchase_details(purchase_id);
    CREATE INDEX IF NOT EXISTS idx_purchase_details_product_id ON purchase_details(product_id);
  END IF;

  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'inventory_movements') THEN
    CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON inventory_movements(product_id);
    CREATE INDEX IF NOT EXISTS idx_inventory_movements_date ON inventory_movements(movement_date DESC);
  END IF;
END $$;

-- Verificar que se haya agregado la columna description a purchases
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'purchases' AND column_name = 'description'
  ) THEN
    ALTER TABLE purchases ADD COLUMN description TEXT;
  END IF;
END $$;

-- Si necesitas recrear completamente, ejecuta esto:
/*
-- Descomentar si necesitas empezar de cero:

DROP TABLE IF EXISTS recipe_items CASCADE;
DROP TABLE IF EXISTS recipes CASCADE;
DROP TABLE IF EXISTS inventory_movements CASCADE;
DROP TABLE IF EXISTS sale_details CASCADE;
DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS purchase_details CASCADE;
DROP TABLE IF EXISTS purchases CASCADE;
DROP TABLE IF EXISTS suppliers CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;

-- Luego ejecutar:
-- psql -U postgres.wltzmponhdrmtylmxxiu -h aws-1-us-east-1.pooler.supabase.com -d postgres -f database/schema.sql
-- psql -U postgres.wltzmponhdrmtylmxxiu -h aws-1-us-east-1.pooler.supabase.com -d postgres -f database/seed.sql
*/
