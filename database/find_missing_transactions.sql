-- Find pledges that are NOT in transaction_logs
SELECT 
  p.id as pledge_id,
  p.tran_id,
  p.project_id,
  p.user_id,
  p.reward_id,
  p.amount,
  p.status,
  p.created_at
FROM pledges p
LEFT JOIN transaction_logs tl ON p.tran_id = tl.tran_id
WHERE p.status = 'paid' 
  AND p.tran_id IS NOT NULL
  AND tl.tran_id IS NULL
ORDER BY p.created_at DESC;
