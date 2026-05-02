-- Safe migration: Add delivered and paid columns to sales table if they don't exist
-- These columns are used by the frontend to track delivery and payment status

-- Check and add delivered column only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales' AND column_name = 'delivered'
    ) THEN
        ALTER TABLE sales ADD COLUMN delivered BOOLEAN DEFAULT false;
    END IF;
END
$$;

-- Check and add paid column only if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'sales' AND column_name = 'paid'
    ) THEN
        ALTER TABLE sales ADD COLUMN paid BOOLEAN DEFAULT false;
    END IF;
END
$$;

-- Update existing records based on status
-- Mark as delivered if status is 'listo' or 'entregado'
UPDATE sales SET delivered = true WHERE status IN ('listo', 'entregado') AND delivered = false;

-- Ensure paid is false for all (conservative approach)
UPDATE sales SET paid = false WHERE paid IS NULL;
