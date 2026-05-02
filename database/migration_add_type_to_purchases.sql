-- Migration: Add expense type field to purchases table
-- This allows classifying expenses as operational (operativo) or ingredients (ingredientes)

ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS type VARCHAR(30) DEFAULT 'operativo';

-- Create index for type field for faster filtering
CREATE INDEX IF NOT EXISTS idx_purchases_type ON purchases(type);
