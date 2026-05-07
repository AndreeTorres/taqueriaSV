-- Migración: Remover campos de stock de la tabla products
-- Fecha: 2026-05-05
-- Descripción: Elimina los campos stock_current y stock_minimum de la tabla products

ALTER TABLE products
DROP COLUMN IF EXISTS stock_current,
DROP COLUMN IF EXISTS stock_minimum;
