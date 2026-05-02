-- Add type column to purchases table
ALTER TABLE purchases 
ADD COLUMN IF NOT EXISTS type VARCHAR(30) DEFAULT 'operativo';

-- Create index for type field
CREATE INDEX IF NOT EXISTS idx_purchases_type ON purchases(type);
