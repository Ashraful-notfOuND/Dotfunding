-- Complete migration to add backer_message support
-- Run this in your Supabase SQL Editor

-- 1. Add backer_message column to notifications table
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS backer_message TEXT;

COMMENT ON COLUMN notifications.backer_message IS 'Optional message from the backer when making a pledge';

-- 2. Add backer_message column to payment_sessions table
ALTER TABLE payment_sessions
ADD COLUMN IF NOT EXISTS backer_message TEXT;

COMMENT ON COLUMN payment_sessions.backer_message IS 'Optional message from the backer when initiating payment';

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'notifications' AND column_name = 'backer_message';

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'payment_sessions' AND column_name = 'backer_message';
