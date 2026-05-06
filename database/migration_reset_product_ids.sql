-- Migración: Resetear secuencia de IDs en la tabla products
-- Fecha: 2026-05-05
-- Descripción: Reinicia la secuencia de auto-incremento de products para que empiece desde 1

-- Primero, eliminamos la restricción de clave foránea en sale_details si existe
ALTER TABLE sale_details DROP CONSTRAINT IF EXISTS sale_details_product_id_fkey CASCADE;

-- Eliminamos registros huérfanos en sale_details (product_id que no existen en products)
DELETE FROM sale_details
WHERE product_id NOT IN (SELECT id FROM products);

-- Reordenamos los IDs existentes para que sean consecutivos desde 1
WITH numbered_products AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY id) as new_id
  FROM products
)
UPDATE products
SET id = numbered_products.new_id
FROM numbered_products
WHERE products.id = numbered_products.id;

-- Recreamos la restricción de clave foránea
ALTER TABLE sale_details
ADD CONSTRAINT sale_details_product_id_fkey 
FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE;

-- Resetear la secuencia al siguiente ID disponible
SELECT setval(pg_get_serial_sequence('products', 'id'), (SELECT MAX(id) + 1 FROM products));
