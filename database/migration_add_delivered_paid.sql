-- Migration: Add delivered and paid columns to sales table
-- These columns are used by the frontend to track delivery and payment status

ALTER TABLE sales ADD COLUMN delivered BOOLEAN DEFAULT false;
ALTER TABLE sales ADD COLUMN paid BOOLEAN DEFAULT false;

-- Update existing records based on status and payment_method
-- Mark as delivered if status is 'listo' or 'entregado'
UPDATE sales SET delivered = true WHERE status IN ('listo', 'entregado');

-- Mark as paid if there's a payment_method (initially all have efectivo)
-- This is a conservative approach - you may want to adjust based on your business logic
UPDATE sales SET paid = false;
