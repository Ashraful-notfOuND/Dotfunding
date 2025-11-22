-- Create payment_sessions table to store transaction metadata
-- This is needed because payment gateways often strip custom query parameters from redirect URLs

CREATE TABLE IF NOT EXISTS payment_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tran_id TEXT UNIQUE NOT NULL,
  project_id UUID,
  user_id UUID,
  reward_id UUID,
  amount DECIMAL(10, 2),
  return_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on tran_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_payment_sessions_tran_id ON payment_sessions(tran_id);

-- Add foreign key constraint to main_projects table
ALTER TABLE payment_sessions 
  ADD CONSTRAINT fk_payment_sessions_project 
  FOREIGN KEY (project_id) REFERENCES main_projects(id) ON DELETE SET NULL;

-- Optional: Add cleanup policy for old sessions (older than 24 hours)
-- You can run this periodically or set up a cron job
-- DELETE FROM payment_sessions WHERE created_at < NOW() - INTERVAL '24 hours';
