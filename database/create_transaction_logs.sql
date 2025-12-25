-- Transaction Logs Table
-- This table stores comprehensive logs of all payment transactions
-- including successful payments, failures, and refunds

CREATE TABLE IF NOT EXISTS transaction_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Transaction identifiers
  tran_id TEXT NOT NULL UNIQUE,
  val_id TEXT,
  
  -- Related entities
  project_id UUID REFERENCES main_projects(id) ON DELETE SET NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  reward_id UUID REFERENCES reward_table(id) ON DELETE SET NULL,
  pledge_id UUID REFERENCES pledges(id) ON DELETE SET NULL,
  
  -- Transaction details
  amount DECIMAL(10, 2) NOT NULL,
  currency TEXT DEFAULT 'BDT', -- Bangladeshi Taka
  
  -- Payment gateway information
  gateway_type TEXT DEFAULT 'sslcommerz',
  card_type TEXT,
  card_brand TEXT,
  card_issuer TEXT,
  card_issuer_country TEXT,
  
  -- Transaction status
  status TEXT NOT NULL, -- 'success', 'failed', 'pending', 'cancelled', 'refunded'
  risk_level INTEGER DEFAULT 0,
  
  -- Customer information
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  
  -- Gateway response
  gateway_response JSONB,
  error_message TEXT,
  
  -- Receipt information
  receipt_pdf_url TEXT,
  receipt_generated_at TIMESTAMPTZ,
  
  -- Timestamps
  transaction_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_transaction_logs_tran_id ON transaction_logs(tran_id);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_project_id ON transaction_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_user_id ON transaction_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_status ON transaction_logs(status);
CREATE INDEX IF NOT EXISTS idx_transaction_logs_date ON transaction_logs(transaction_date DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_transaction_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS transaction_logs_updated_at ON transaction_logs;
CREATE TRIGGER transaction_logs_updated_at
  BEFORE UPDATE ON transaction_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_transaction_logs_updated_at();

-- Enable Row Level Security
ALTER TABLE transaction_logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view own transactions" ON transaction_logs;
DROP POLICY IF EXISTS "Creators can view project transactions" ON transaction_logs;
DROP POLICY IF EXISTS "Service role full access" ON transaction_logs;

-- Policy: Users can view their own transaction logs
CREATE POLICY "Users can view own transactions"
  ON transaction_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Policy: Project creators can view transactions for their projects
CREATE POLICY "Creators can view project transactions"
  ON transaction_logs
  FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM main_projects WHERE user_id = auth.uid()
    )
  );

-- Policy: Service role can do everything (for backend operations)
CREATE POLICY "Service role full access"
  ON transaction_logs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Comment on table
COMMENT ON TABLE transaction_logs IS 'Comprehensive logs of all payment transactions with PDF receipt generation support';
