-- Add INSERT policy for backend to create transaction logs
DROP POLICY IF EXISTS "Backend can insert transactions" ON transaction_logs;

CREATE POLICY "Backend can insert transactions"
  ON transaction_logs
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Verify all policies exist
SELECT schemaname, tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename = 'transaction_logs'
ORDER BY cmd, policyname;
