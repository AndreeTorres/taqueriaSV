-- Migration: Subscriptions table
-- Tracks the subscription plan and status for each business

CREATE TABLE IF NOT EXISTS subscriptions (
  id SERIAL PRIMARY KEY,
  business_id INT NOT NULL REFERENCES businesses(id),
  plan VARCHAR(50) NOT NULL DEFAULT 'basico',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  starts_at TIMESTAMP NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- One active subscription per business
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_business_active
  ON subscriptions(business_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_subscriptions_business_id ON subscriptions(business_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Insert default active subscription for existing business
INSERT INTO subscriptions (business_id, plan, status, starts_at)
VALUES (1, 'basico', 'active', NOW())
ON CONFLICT DO NOTHING;
