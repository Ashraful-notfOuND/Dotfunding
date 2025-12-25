-- Diagnostic Script: Check Transaction Data
-- Run this to see what data exists in your database

-- 1. Check if transaction_logs table exists and has data
SELECT 'transaction_logs' as table_name, COUNT(*) as row_count FROM transaction_logs;

-- 2. Check pledges table for paid pledges with tran_id
SELECT 
  'pledges' as table_name,
  COUNT(*) as total_pledges,
  COUNT(CASE WHEN status = 'paid' THEN 1 END) as paid_pledges,
  COUNT(CASE WHEN status = 'paid' AND tran_id IS NOT NULL THEN 1 END) as paid_with_tran_id
FROM pledges;

-- 3. Show recent paid pledges with their tran_id values
SELECT 
  id,
  project_id,
  user_id,
  reward_id,
  amount,
  status,
  tran_id,
  created_at
FROM pledges 
WHERE status = 'paid'
ORDER BY created_at DESC
LIMIT 5;

-- 4. Check if any pledges exist that aren't in transaction_logs
SELECT 
  p.id as pledge_id,
  p.tran_id,
  p.project_id,
  p.amount,
  p.status,
  p.created_at,
  CASE 
    WHEN tl.tran_id IS NULL THEN 'NOT IN transaction_logs'
    ELSE 'Already logged'
  END as log_status
FROM pledges p
LEFT JOIN transaction_logs tl ON p.tran_id = tl.tran_id
WHERE p.status = 'paid' AND p.tran_id IS NOT NULL
ORDER BY p.created_at DESC
LIMIT 10;

-- 5. Show what's actually in transaction_logs
SELECT 
  tran_id,
  project_id,
  user_id,
  amount,
  status,
  receipt_pdf_url,
  created_at
FROM transaction_logs
ORDER BY created_at DESC
LIMIT 5;
