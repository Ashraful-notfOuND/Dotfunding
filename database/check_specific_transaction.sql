-- Quick check: Does this specific transaction exist?
SELECT * FROM transaction_logs WHERE tran_id = 'tran_1763367832857_fvo95y';

-- Check if it exists in pledges
SELECT * FROM pledges WHERE tran_id = 'tran_1763367832857_fvo95y';

-- Count total in each table
SELECT 'transaction_logs count' as info, COUNT(*) FROM transaction_logs
UNION ALL
SELECT 'pledges with tran_id count', COUNT(*) FROM pledges WHERE tran_id IS NOT NULL AND status = 'paid';
