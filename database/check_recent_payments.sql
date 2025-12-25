-- Find the most recent pledges and their transaction log status
SELECT 
  p.id as pledge_id,
  p.tran_id,
  p.project_id,
  p.amount,
  p.status,
  p.created_at as pledge_created,
  CASE 
    WHEN tl.tran_id IS NOT NULL THEN 'Logged'
    ELSE 'NOT LOGGED'
  END as log_status,
  tl.receipt_pdf_url
FROM pledges p
LEFT JOIN transaction_logs tl ON p.tran_id = tl.tran_id
WHERE p.status = 'paid'
ORDER BY p.created_at DESC
LIMIT 10;
