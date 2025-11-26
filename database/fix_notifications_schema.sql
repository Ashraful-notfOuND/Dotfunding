-- Fix notifications table to make project_id nullable
-- This allows general notifications (recommendations, interests) that aren't tied to specific projects

ALTER TABLE notifications 
  ALTER COLUMN project_id DROP NOT NULL;

-- Add comment to clarify usage
COMMENT ON COLUMN notifications.project_id IS 'Optional. NULL for general notifications (recommendations, interest matches), set for project-specific notifications (updates, milestones, comments)';
