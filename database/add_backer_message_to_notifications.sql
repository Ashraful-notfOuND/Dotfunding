-- Add backer_message column to notifications table
-- This stores the optional message that backers can leave when pledging

ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS backer_message TEXT;

-- Add a comment to document the column
COMMENT ON COLUMN notifications.backer_message IS 'Optional message from the backer when making a pledge';
