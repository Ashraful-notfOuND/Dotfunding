-- Manually insert the newest missing transaction
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
WHERE p.tran_id = 'tran_1766395916277_gbipg1'
AND p.status = 'paid';

-- Verify it was inserted
SELECT * FROM transaction_logs WHERE tran_id = 'tran_1766395916277_gbipg1';
