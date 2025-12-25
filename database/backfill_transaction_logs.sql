-- Backfill Transaction Logs for Existing Pledges
-- This script creates transaction log entries for pledges that were made
-- before the transaction_logs system was set up

-- Insert transaction logs for all existing paid pledges
INSERT INTO transaction_logs (
  tran_id,
  project_id,
  user_id,
  reward_id,
  pledge_id,
  amount,
  currency,
  status,
  customer_name,
  customer_email,
  customer_phone,
  transaction_date,
  created_at
)
SELECT 
  p.tran_id,
  p.project_id,
  p.user_id,
  p.reward_id,
  p.id as pledge_id,
  p.amount,
  'BDT' as currency,
  'success' as status,
  u.full_name as customer_name,
  u.email as customer_email,
  u.phone as customer_phone,
  p.created_at as transaction_date,
  NOW() as created_at
FROM pledges p
LEFT JOIN users u ON p.user_id = u.id
WHERE p.status = 'paid'
  AND p.tran_id IS NOT NULL
  AND p.tran_id NOT IN (
    SELECT tran_id FROM transaction_logs WHERE tran_id IS NOT NULL
  )
ORDER BY p.created_at;

-- Show count of backfilled transactions
SELECT COUNT(*) as backfilled_transactions FROM transaction_logs;

-- Note: PDF receipts will be generated on-demand when users try to download them
-- The receipt generation happens automatically via the API
