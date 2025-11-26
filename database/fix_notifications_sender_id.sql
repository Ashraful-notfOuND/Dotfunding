-- Fix notifications table to make optional columns nullable
-- System-generated notifications don't have sender, project, or amount

ALTER TABLE notifications 
  ALTER COLUMN sender_id DROP NOT NULL;

ALTER TABLE notifications 
  ALTER COLUMN project_id DROP NOT NULL;

ALTER TABLE notifications 
  ALTER COLUMN amount DROP NOT NULL;

-- Add comments to clarify usage
COMMENT ON COLUMN notifications.sender_id IS 'Optional. NULL for system-generated notifications (recommendations, interest matches), set for user-sent notifications';
COMMENT ON COLUMN notifications.project_id IS 'Optional. NULL for general notifications (recommendations, interest matches), set for project-specific notifications (updates, milestones, comments)';
COMMENT ON COLUMN notifications.amount IS 'Optional. NULL for non-payment notifications, set for donation/payment notifications';
