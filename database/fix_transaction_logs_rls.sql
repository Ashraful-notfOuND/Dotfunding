-- Add policy to allow backend (anon key) to read transaction_logs
-- This is needed because the backend uses SUPABASE_KEY (anon key) not service_role

-- Drop if exists
DROP POLICY IF EXISTS "Backend can read all transactions" ON transaction_logs;

-- Allow anonymous role (backend) to read all transactions
CREATE POLICY "Backend can read all transactions"
  ON transaction_logs
  FOR SELECT
  TO anon
  USING (true);

-- Also allow anon to update (for PDF generation)
DROP POLICY IF EXISTS "Backend can update transactions" ON transaction_logs;

CREATE POLICY "Backend can update transactions"
  ON transaction_logs
  FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Verify policies
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'transaction_logs';
