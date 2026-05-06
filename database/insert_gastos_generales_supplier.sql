-- Inserta el proveedor "Gastos Generales" para cada negocio existente
INSERT INTO suppliers (name, phone, address, supplied_product, status, business_id)
SELECT 
  'Gastos Generales' AS name,
  NULL AS phone,
  NULL AS address,
  NULL AS supplied_product,
  'active' AS status,
  b.id AS business_id
FROM businesses b
WHERE NOT EXISTS (
  SELECT 1 FROM suppliers 
  WHERE name = 'Gastos Generales' AND business_id = b.id
)
ON CONFLICT DO NOTHING;
