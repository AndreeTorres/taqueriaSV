-- ============================================================================
-- SCRIPT: Inserción de Productos - Taquería Los Campos
-- Fecha: 7 de mayo de 2026
-- Business ID: 1
-- NOTA: Script para inserción desde cero (reinicia índices)
-- ============================================================================
-- PASO 1: ELIMINAR TODOS LOS PRODUCTOS Y CATEGORÍAS ACTUALES DEL NEGOCIO
-- ============================================================================

-- Primero, eliminamos los detalles de las recetas que dependan de productos
DELETE FROM recipe_items 
WHERE recipe_id IN (
  SELECT r.id FROM recipes r
  JOIN products p ON r.product_id = p.id
  WHERE p.business_id = 1
);

-- Luego, eliminamos las recetas que usen productos del negocio
DELETE FROM recipes 
WHERE product_id IN (
  SELECT id FROM products WHERE business_id = 1
);

-- Eliminamos los detalles de venta (sale_details)
DELETE FROM sale_details 
WHERE sale_id IN (
  SELECT id FROM sales WHERE business_id = 1
);

-- Eliminamos las ventas del negocio
DELETE FROM sales WHERE business_id = 1;

-- Eliminamos los detalles de compra (purchase_details)
DELETE FROM purchase_details 
WHERE purchase_id IN (
  SELECT id FROM purchases WHERE business_id = 1
);

-- Eliminamos las compras del negocio
DELETE FROM purchases WHERE business_id = 1;

-- Eliminamos los movimientos de inventario
DELETE FROM inventory_movements 
WHERE product_id IN (
  SELECT id FROM products WHERE business_id = 1
);

-- Eliminamos todos los productos del negocio
DELETE FROM products WHERE business_id = 1;

-- Eliminamos todas las categorías del negocio
DELETE FROM categories WHERE business_id = 1;

-- REINICIAR LOS ÍNDICES (SEQUENCES)
-- Primero eliminamos completamente para asegurar limpieza
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE categories CASCADE;

-- Reiniciamos las secuencias a 1
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;

-- ============================================================================
-- PASO 2: INSERTAR NUEVAS CATEGORÍAS - MENÚ TAQUERÍA LOS CAMPOS
-- ============================================================================

INSERT INTO categories (name, description, status, business_id, created_at, updated_at)
VALUES
  ('Sopas', 'Sopas tradicionales', 'active', 1, NOW(), NOW()),
  ('Tacos', 'Tacos de diferentes proteínas', 'active', 1, NOW(), NOW()),
  ('Burritos', 'Burritos de diferentes proteínas', 'active', 1, NOW(), NOW()),
  ('Quesadillas', 'Quesadillas de diferentes proteínas', 'active', 1, NOW(), NOW()),
  ('Tortas', 'Tortas de diferentes proteínas', 'active', 1, NOW(), NOW()),
  ('Asados', 'Asados tradicionales', 'active', 1, NOW(), NOW()),
  ('Combos', 'Combos con bebida incluida', 'active', 1, NOW(), NOW()),
  ('Limonadas', 'Limonadas frescas', 'active', 1, NOW(), NOW()),
  ('Naturales y licuados', 'Bebidas naturales y licuados', 'active', 1, NOW(), NOW()),
  ('Bebidas enlatadas', 'Sodas, jugos y cervezas enlatadas', 'active', 1, NOW(), NOW()),
  ('Café', 'Café y bebidas calientes', 'active', 1, NOW(), NOW());

-- ============================================================================
-- PASO 3: INSERTAR NUEVOS PRODUCTOS - MENÚ COMPLETO TAQUERÍA LOS CAMPOS
-- ============================================================================

-- SOPAS (Categoría ID: 1)
INSERT INTO products (name, category_id, product_type, unit_measure, purchase_price, sale_price, status, business_id, created_at, updated_at)
VALUES
  ('Sopa de Tortilla', 1, 'producto para venta', 'plato', 2.50, 4.99, 'active', 1, NOW(), NOW()),
  ('Sopa de Gallina Sencilla', 1, 'producto para venta', 'plato', 1.50, 3.00, 'active', 1, NOW(), NOW()),
  ('Sopa de Gallina con 1/4 Asado', 1, 'producto para venta', 'plato', 2.75, 5.00, 'active', 1, NOW(), NOW());

-- TACOS (Categoría ID: 2)
INSERT INTO products (name, category_id, product_type, unit_measure, purchase_price, sale_price, status, business_id, created_at, updated_at)
VALUES
  ('Tacos de Res', 2, 'producto para venta', 'orden', 2.00, 4.00, 'active', 1, NOW(), NOW()),
  ('Tacos de Pollo', 2, 'producto para venta', 'orden', 2.00, 4.00, 'active', 1, NOW(), NOW()),
  ('Tacos de Chorizo', 2, 'producto para venta', 'orden', 2.00, 4.00, 'active', 1, NOW(), NOW()),
  ('Tacos Mixtos', 2, 'producto para venta', 'orden', 2.20, 4.00, 'active', 1, NOW(), NOW());

-- BURRITOS (Categoría ID: 3)
INSERT INTO products (name, category_id, product_type, unit_measure, purchase_price, sale_price, status, business_id, created_at, updated_at)
VALUES
  ('Burrito de Res', 3, 'producto para venta', 'unidad', 2.50, 5.00, 'active', 1, NOW(), NOW()),
  ('Burrito de Pollo', 3, 'producto para venta', 'unidad', 2.50, 5.00, 'active', 1, NOW(), NOW()),
  ('Burrito de Chorizo', 3, 'producto para venta', 'unidad', 2.50, 5.00, 'active', 1, NOW(), NOW()),
  ('Burrito Mixto', 3, 'producto para venta', 'unidad', 2.75, 5.00, 'active', 1, NOW(), NOW());

-- QUESADILLAS (Categoría ID: 4)
INSERT INTO products (name, category_id, product_type, unit_measure, purchase_price, sale_price, status, business_id, created_at, updated_at)
VALUES
  ('Quesadilla de Res', 4, 'producto para venta', 'unidad', 2.50, 5.00, 'active', 1, NOW(), NOW()),
  ('Quesadilla de Pollo', 4, 'producto para venta', 'unidad', 2.50, 5.00, 'active', 1, NOW(), NOW()),
  ('Quesadilla de Chorizo', 4, 'producto para venta', 'unidad', 2.50, 5.00, 'active', 1, NOW(), NOW()),
  ('Quesadilla Mixta', 4, 'producto para venta', 'unidad', 2.75, 5.00, 'active', 1, NOW(), NOW());

-- TORTAS (Categoría ID: 5)
INSERT INTO products (name, category_id, product_type, unit_measure, purchase_price, sale_price, status, business_id, created_at, updated_at)
VALUES
  ('Torta de Res', 5, 'producto para venta', 'unidad', 2.50, 5.00, 'active', 1, NOW(), NOW()),
  ('Torta de Pollo', 5, 'producto para venta', 'unidad', 2.50, 5.00, 'active', 1, NOW(), NOW()),
  ('Torta de Chorizo', 5, 'producto para venta', 'unidad', 2.50, 5.00, 'active', 1, NOW(), NOW()),
  ('Torta Mixta', 5, 'producto para venta', 'unidad', 2.75, 5.00, 'active', 1, NOW(), NOW());

-- ASADOS (Categoría ID: 6)
INSERT INTO products (name, category_id, product_type, unit_measure, purchase_price, sale_price, status, business_id, created_at, updated_at)
VALUES
  ('Asado de Res', 6, 'producto para venta', 'plato', 2.50, 4.99, 'active', 1, NOW(), NOW()),
  ('Asado de Pollo', 6, 'producto para venta', 'plato', 2.50, 4.99, 'active', 1, NOW(), NOW());

-- COMBOS (Categoría ID: 7)
INSERT INTO products (name, category_id, product_type, unit_measure, purchase_price, sale_price, status, business_id, created_at, updated_at)
VALUES
  ('Alitas + Papa + Soda', 7, 'producto para venta', 'combo', 2.25, 4.50, 'active', 1, NOW(), NOW()),
  ('Dedos de Queso + Papa + Soda', 7, 'producto para venta', 'combo', 2.25, 4.50, 'active', 1, NOW(), NOW()),
  ('Pechuguitas + Papa + Soda', 7, 'producto para venta', 'combo', 2.25, 4.50, 'active', 1, NOW(), NOW()),
  ('Salchipapas + Bebida', 7, 'producto para venta', 'combo', 2.00, 4.00, 'active', 1, NOW(), NOW()),
  ('Almuerzos + Bebida', 7, 'producto para venta', 'combo', 1.50, 3.00, 'active', 1, NOW(), NOW());

-- LIMONADAS (Categoría ID: 8)
INSERT INTO products (name, category_id, product_type, unit_measure, purchase_price, sale_price, status, business_id, created_at, updated_at)
VALUES
  ('Limonada Fresa', 8, 'producto para venta', 'vaso', 0.50, 2.00, 'active', 1, NOW(), NOW()),
  ('Limonada con Hierba', 8, 'producto para venta', 'vaso', 0.50, 2.00, 'active', 1, NOW(), NOW()),
  ('Limonada Natural', 8, 'producto para venta', 'vaso', 0.40, 1.75, 'active', 1, NOW(), NOW());

-- NATURALES Y LICUADOS (Categoría ID: 9)
INSERT INTO products (name, category_id, product_type, unit_measure, purchase_price, sale_price, status, business_id, created_at, updated_at)
VALUES
  ('Naturales de Fruta', 9, 'producto para venta', 'vaso', 0.40, 1.75, 'active', 1, NOW(), NOW()),
  ('Licuados', 9, 'producto para venta', 'vaso', 0.50, 1.75, 'active', 1, NOW(), NOW());

-- BEBIDAS ENLATADAS (Categoría ID: 10)
INSERT INTO products (name, category_id, product_type, unit_measure, purchase_price, sale_price, status, business_id, created_at, updated_at)
VALUES
  ('Soda Lata', 10, 'producto para venta', 'lata', 0.40, 1.00, 'active', 1, NOW(), NOW()),
  ('Te Helado', 10, 'producto para venta', 'lata', 0.30, 1.00, 'active', 1, NOW(), NOW()),
  ('Jugo Lata', 10, 'producto para venta', 'lata', 0.35, 1.00, 'active', 1, NOW(), NOW()),
  ('Agua', 10, 'producto para venta', 'botella', 0.15, 0.50, 'active', 1, NOW(), NOW()),
  ('Cerveza Lata', 10, 'producto para venta', 'lata', 0.80, 1.50, 'active', 1, NOW(), NOW());

-- CAFÉ (Categoría ID: 11)
INSERT INTO products (name, category_id, product_type, unit_measure, purchase_price, sale_price, status, business_id, created_at, updated_at)
VALUES
  ('Café', 11, 'producto para venta', 'taza', 0.35, 0.75, 'active', 1, NOW(), NOW()),
  ('Café con Leche', 11, 'producto para venta', 'taza', 0.45, 1.00, 'active', 1, NOW(), NOW()),
  ('Capuchino', 11, 'producto para venta', 'taza', 0.50, 1.00, 'active', 1, NOW(), NOW());

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================
-- Ver los productos insertados agrupados por categoría
SELECT 
  c.name as categoria,
  p.id,
  p.name,
  p.sale_price as precio_venta,
  p.purchase_price as precio_compra,
  p.unit_measure as unidad,
  p.status
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.business_id = 1
ORDER BY c.name, p.id;

-- Resumen por categoría
SELECT 
  c.name as categoria,
  COUNT(p.id) as cantidad_productos
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.business_id = 1
GROUP BY c.id, c.name
ORDER BY c.name;

-- Total general
SELECT COUNT(*) as total_productos FROM products WHERE business_id = 1;

-- ============================================================================
-- AJUSTE DE ÍNDICES (SEQUENCES) - EJECUTAR ESTA PARTE DESPUÉS DE INSERTAR
-- ============================================================================
-- IMPORTANTE: Ejecuta SOLO esta sección si necesitas reiniciar los IDs a 1-n
-- Sigue estos pasos en orden:
-- 1. Ejecuta TODO el script (PASO 1, 2, 3 y VERIFICACIÓN)
-- 2. Luego ejecuta SOLO esta sección de AJUSTE

-- PASO A: Eliminar todo de nuevo para limpiar
DELETE FROM recipe_items 
WHERE recipe_id IN (
  SELECT r.id FROM recipes r
  JOIN products p ON r.product_id = p.id
  WHERE p.business_id = 1
);

DELETE FROM recipes 
WHERE product_id IN (
  SELECT id FROM products WHERE business_id = 1
);

DELETE FROM sale_details 
WHERE sale_id IN (
  SELECT id FROM sales WHERE business_id = 1
);

DELETE FROM sales WHERE business_id = 1;

DELETE FROM purchase_details 
WHERE purchase_id IN (
  SELECT id FROM purchases WHERE business_id = 1
);

DELETE FROM purchases WHERE business_id = 1;

DELETE FROM inventory_movements 
WHERE product_id IN (
  SELECT id FROM products WHERE business_id = 1
);

DELETE FROM products WHERE business_id = 1;
DELETE FROM categories WHERE business_id = 1;

-- PASO B: Limpiar completamente con TRUNCATE
TRUNCATE TABLE products CASCADE;
TRUNCATE TABLE categories CASCADE;

-- PASO C: Reiniciar secuencias a 1
ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;

-- PASO D: Re-insertar categorías
INSERT INTO categories (name, description, status, business_id, created_at, updated_at)
VALUES
  ('Sopas', 'Sopas tradicionales', 'active', 1, NOW(), NOW()),
  ('Tacos', 'Tacos de diferentes proteínas', 'active', 1, NOW(), NOW()),
  ('Burritos', 'Burritos de diferentes proteínas', 'active', 1, NOW(), NOW()),
  ('Quesadillas', 'Quesadillas de diferentes proteínas', 'active', 1, NOW(), NOW()),
  ('Tortas', 'Tortas de diferentes proteínas', 'active', 1, NOW(), NOW()),
  ('Asados', 'Asados tradicionales', 'active', 1, NOW(), NOW()),
  ('Combos', 'Combos con bebida incluida', 'active', 1, NOW(), NOW()),
  ('Limonadas', 'Limonadas frescas', 'active', 1, NOW(), NOW()),
  ('Naturales y licuados', 'Bebidas naturales y licuados', 'active', 1, NOW(), NOW()),
  ('Bebidas enlatadas', 'Sodas, jugos y cervezas enlatadas', 'active', 1, NOW(), NOW()),
  ('Café', 'Café y bebidas calientes', 'active', 1, NOW(), NOW());

-- PASO E: Re-insertar productos
INSERT INTO products (name, category_id, product_type, unit_measure, purchase_price, sale_price, status, business_id, created_at, updated_at)
VALUES
  ('Sopa de Tortilla', 1, 'producto para venta', 'plato', 2.50, 4.99, 'active', 1, NOW(), NOW()),
  ('Sopa de Gallina Sencilla', 1, 'producto para venta', 'plato', 1.50, 3.00, 'active', 1, NOW(), NOW()),
  ('Sopa de Gallina con 1/4 Asado', 1, 'producto para venta', 'plato', 2.75, 5.00, 'active', 1, NOW(), NOW()),
  ('Tacos de Res', 2, 'producto para venta', 'orden', 2.00, 4.00, 'active', 1, NOW(), NOW()),
  ('Tacos de Pollo', 2, 'producto para venta', 'orden', 2.00, 4.00, 'active', 1, NOW(), NOW()),
  ('Tacos de Chorizo', 2, 'producto para venta', 'orden', 2.00, 4.00, 'active', 1, NOW(), NOW()),
  ('Tacos Mixtos', 2, 'producto para venta', 'orden', 2.20, 4.00, 'active', 1, NOW(), NOW()),
  ('Burrito de Res', 3, 'producto para venta', 'unidad', 2.50, 5.00, 'active', 1, NOW(), NOW()),
  ('Burrito de Pollo', 3, 'producto para venta', 'unidad', 2.50, 5.00, 'active', 1, NOW(), NOW()),
  ('Burrito de Chorizo', 3, 'producto para venta', 'unidad', 2.50, 5.00, 'active', 1, NOW(), NOW()),
  ('Burrito Mixto', 3, 'producto para venta', 'unidad', 2.75, 5.00, 'active', 1, NOW(), NOW()),
  ('Quesadilla de Res', 4, 'producto para venta', 'unidad', 2.50, 5.00, 'active', 1, NOW(), NOW()),
  ('Quesadilla de Pollo', 4, 'producto para venta', 'unidad', 2.50, 5.00, 'active', 1, NOW(), NOW()),
  ('Quesadilla de Chorizo', 4, 'producto para venta', 'unidad', 2.50, 5.00, 'active', 1, NOW(), NOW()),
  ('Quesadilla Mixta', 4, 'producto para venta', 'unidad', 2.75, 5.00, 'active', 1, NOW(), NOW()),
  ('Torta de Res', 5, 'producto para venta', 'unidad', 2.50, 5.00, 'active', 1, NOW(), NOW()),
  ('Torta de Pollo', 5, 'producto para venta', 'unidad', 2.50, 5.00, 'active', 1, NOW(), NOW()),
  ('Torta de Chorizo', 5, 'producto para venta', 'unidad', 2.50, 5.00, 'active', 1, NOW(), NOW()),
  ('Torta Mixta', 5, 'producto para venta', 'unidad', 2.75, 5.00, 'active', 1, NOW(), NOW()),
  ('Asado de Res', 6, 'producto para venta', 'plato', 2.50, 4.99, 'active', 1, NOW(), NOW()),
  ('Asado de Pollo', 6, 'producto para venta', 'plato', 2.50, 4.99, 'active', 1, NOW(), NOW()),
  ('Alitas + Papa + Soda', 7, 'producto para venta', 'combo', 2.25, 4.50, 'active', 1, NOW(), NOW()),
  ('Dedos de Queso + Papa + Soda', 7, 'producto para venta', 'combo', 2.25, 4.50, 'active', 1, NOW(), NOW()),
  ('Pechuguitas + Papa + Soda', 7, 'producto para venta', 'combo', 2.25, 4.50, 'active', 1, NOW(), NOW()),
  ('Salchipapas + Bebida', 7, 'producto para venta', 'combo', 2.00, 4.00, 'active', 1, NOW(), NOW()),
  ('Almuerzos + Bebida', 7, 'producto para venta', 'combo', 1.50, 3.00, 'active', 1, NOW(), NOW()),
  ('Limonada Fresa', 8, 'producto para venta', 'vaso', 0.50, 2.00, 'active', 1, NOW(), NOW()),
  ('Limonada con Hierba', 8, 'producto para venta', 'vaso', 0.50, 2.00, 'active', 1, NOW(), NOW()),
  ('Limonada Natural', 8, 'producto para venta', 'vaso', 0.40, 1.75, 'active', 1, NOW(), NOW()),
  ('Naturales de Fruta', 9, 'producto para venta', 'vaso', 0.40, 1.75, 'active', 1, NOW(), NOW()),
  ('Licuados', 9, 'producto para venta', 'vaso', 0.50, 1.75, 'active', 1, NOW(), NOW()),
  ('Soda Lata', 10, 'producto para venta', 'lata', 0.40, 1.00, 'active', 1, NOW(), NOW()),
  ('Te Helado', 10, 'producto para venta', 'lata', 0.30, 1.00, 'active', 1, NOW(), NOW()),
  ('Jugo Lata', 10, 'producto para venta', 'lata', 0.35, 1.00, 'active', 1, NOW(), NOW()),
  ('Agua', 10, 'producto para venta', 'botella', 0.15, 0.50, 'active', 1, NOW(), NOW()),
  ('Cerveza Lata', 10, 'producto para venta', 'lata', 0.80, 1.50, 'active', 1, NOW(), NOW()),
  ('Café', 11, 'producto para venta', 'taza', 0.35, 0.75, 'active', 1, NOW(), NOW()),
  ('Café con Leche', 11, 'producto para venta', 'taza', 0.45, 1.00, 'active', 1, NOW(), NOW()),
  ('Capuchino', 11, 'producto para venta', 'taza', 0.50, 1.00, 'active', 1, NOW(), NOW());

-- PASO F: Verificar que todo quedó bien (IDs deben ser 1-48)
SELECT 
  c.name as categoria,
  p.id,
  p.name,
  p.sale_price as precio_venta,
  p.purchase_price as precio_compra,
  p.unit_measure as unidad,
  p.status
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.business_id = 1
ORDER BY p.id;
