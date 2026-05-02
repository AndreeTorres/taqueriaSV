-- Script para limpiar usuarios en Supabase, dejando solo el admin
-- Copiar y pegar en el SQL Editor de Supabase

DELETE FROM users 
WHERE id NOT IN (
  SELECT u.id FROM users u
  INNER JOIN roles r ON u.role_id = r.id
  WHERE r.name = 'administrador' AND u.email = 'admin@inventario.com'
);

-- Confirmación - usuarios restantes
SELECT id, email, name FROM users;
