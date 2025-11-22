-- Add phone column to users table
-- Run this in your Supabase SQL Editor

ALTER TABLE users
ADD COLUMN IF NOT EXISTS phone TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN users.phone IS 'User phone number (optional)';

-- Verify the change
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'phone';
