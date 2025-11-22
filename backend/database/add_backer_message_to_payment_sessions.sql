-- Add backer_message column to payment_sessions table
-- This stores the optional message from backers during payment initialization

ALTER TABLE payment_sessions
ADD COLUMN IF NOT EXISTS backer_message TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN payment_sessions.backer_message IS 'Optional message from the backer when initiating payment';
