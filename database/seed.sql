INSERT INTO roles (name) VALUES
  ('administrador'),
  ('vendedor'),
  ('encargado de inventario');

INSERT INTO users (role_id, name, email, password, status) VALUES
  (1, 'Admin General', 'admin@inventario.local', '$2y$10$zcl8G6.Li1v7bMqnPdBbtOFETL0IeBZqa50lph4lDmIYcNAdNArqO', 'active'),
  (2, 'Vendedor Uno', 'vendedor@inventario.local', '$2y$10$zcl8G6.Li1v7bMqnPdBbtOFETL0IeBZqa50lph4lDmIYcNAdNArqO', 'active'),
  (3, 'Bodega Uno', 'inventario@inventario.local', '$2y$10$zcl8G6.Li1v7bMqnPdBbtOFETL0IeBZqa50lph4lDmIYcNAdNArqO', 'active');

INSERT INTO categories (name, description, status) VALUES
  ('Comidas principales', 'Hamburguesas, hot dogs, croissants y similares', 'active'),
  ('Antojitos', 'Tacos, burritos, quesadillas y similares', 'active'),
  ('Frituras', 'Nuggets, chunks y similares', 'active'),
  ('Sopas y ensaladas', 'Sopas de tortilla, asados y ensaladas', 'active'),
  ('Bebidas', 'Bebidas embotelladas y naturales', 'active'),
  ('Ingredientes', 'Ingredientes para preparacion de alimentos', 'active');

INSERT INTO products (category_id, name, product_type, unit_measure, purchase_price, sale_price, stock_current, stock_minimum, status) VALUES
  (1, 'Hamburguesa con papas + soda', 'producto para venta', 'unidad', 2.50, 6.00, 50, 10, 'active'),
  (1, 'Hot dog con papa + soda', 'producto para venta', 'unidad', 1.50, 4.00, 40, 10, 'active'),
  (1, 'Croissant con papas + soda', 'producto para venta', 'unidad', 2.50, 6.00, 30, 10, 'active'),
  (1, 'Torta', 'producto para venta', 'unidad', 1.80, 5.00, 35, 10, 'active'),
  (2, 'Tacos', 'producto para venta', 'unidad', 1.50, 5.00, 40, 15, 'active'),
  (2, 'Burritos', 'producto para venta', 'unidad', 1.50, 5.00, 35, 15, 'active'),
  (2, 'Quesadillas', 'producto para venta', 'unidad', 1.50, 5.00, 30, 15, 'active'),
  (3, 'Nuggets con papas + soda', 'producto para venta', 'unidad', 2.00, 5.00, 45, 10, 'active'),
  (3, 'Chunks con papas + soda', 'producto para venta', 'unidad', 2.00, 5.00, 40, 10, 'active'),
  (4, 'Sopa de tortilla', 'producto para venta', 'unidad', 1.50, 4.00, 25, 10, 'active'),
  (4, 'Asado de pollo', 'producto para venta', 'unidad', 2.00, 5.00, 30, 10, 'active'),
  (4, 'Asado de res', 'producto para venta', 'unidad', 2.50, 5.00, 25, 10, 'active'),
  (4, 'Ensalada César', 'producto para venta', 'unidad', 1.80, 5.00, 20, 10, 'active'),
  (6, 'Pollo', 'ingrediente', 'libra', 1.80, 0.00, 80, 20, 'active'),
  (6, 'Res', 'ingrediente', 'libra', 3.00, 0.00, 50, 15, 'active'),
  (6, 'Pan para hamburguesa', 'ingrediente', 'unidad', 0.30, 0.00, 100, 20, 'active'),
  (6, 'Papas fritas congeladas', 'ingrediente', 'libra', 1.50, 0.00, 60, 15, 'active'),
  (5, 'Gaseosa 2L', 'producto para venta', 'unidad', 1.20, 1.75, 40, 10, 'active');

INSERT INTO suppliers (name, phone, address, supplied_product, status) VALUES
  ('Distribuidora El Centro', '7777-1111', 'San Salvador', 'Arroz y frijol', 'active'),
  ('Avicola Primavera', '7777-2222', 'Santa Tecla', 'Pollo', 'active'),
  ('Mayoreo La Bodega', '7777-3333', 'Soyapango', 'Aceite y bebidas', 'active'),
  ('Gastos Generales', NULL, NULL, NULL, 'active');

INSERT INTO recipes (product_id, name, description) VALUES
  (1, 'Hamburguesa con papas + soda', 'Hamburguesa con papas fritas y bebida'),
  (2, 'Hot dog con papa + soda', 'Hot dog con papas fritas y bebida'),
  (3, 'Croissant con papas + soda', 'Croissant con papas fritas y bebida'),
  (11, 'Asado de pollo', 'Asado tradicional de pollo con arroz y frijoles'),
  (12, 'Asado de res', 'Asado tradicional de res con arroz y frijoles');

INSERT INTO recipe_items (recipe_id, ingredient_product_id, quantity) VALUES
  (1, 14, 0.25),
  (1, 17, 0.10),
  (1, 18, 0.30),
  (2, 14, 0.15),
  (2, 17, 0.05),
  (2, 18, 0.25),
  (3, 14, 0.20),
  (3, 17, 0.10),
  (3, 18, 0.25),
  (4, 14, 0.50),
  (5, 15, 0.50);
