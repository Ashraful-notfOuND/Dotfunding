-- Admin System Database Schema
-- This schema implements the admin moderation system for project approval

-- Step 1: Add is_admin column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- Step 2: Add approval status to main_projects table
ALTER TABLE main_projects
ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'paused', 'removed')),
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS admin_message TEXT;

-- Step 3: Create project_reviews table for admin review history
CREATE TABLE IF NOT EXISTS project_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES main_projects(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(20) NOT NULL CHECK (action IN ('approved', 'rejected', 'paused', 'removed', 'resumed')),
    message TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Step 4: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_approval_status ON main_projects(approval_status);
CREATE INDEX IF NOT EXISTS idx_projects_reviewed_at ON main_projects(reviewed_at);
CREATE INDEX IF NOT EXISTS idx_project_reviews_project_id ON project_reviews(project_id);
CREATE INDEX IF NOT EXISTS idx_project_reviews_admin_id ON project_reviews(admin_id);
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin);

-- Step 5: Create RLS policies for admin access
ALTER TABLE project_reviews ENABLE ROW LEVEL SECURITY;

-- Allow admins to insert reviews
CREATE POLICY "Admins can insert reviews" ON project_reviews
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = TRUE
        )
    );

-- Allow everyone to read reviews
CREATE POLICY "Everyone can read reviews" ON project_reviews
    FOR SELECT
    USING (TRUE);

-- Update RLS for main_projects to allow admin modifications
CREATE POLICY "Admins can update all projects" ON main_projects
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users WHERE users.id = auth.uid() AND users.is_admin = TRUE
        )
    );

-- Step 6: Create function to update approval status
CREATE OR REPLACE FUNCTION update_project_approval(
    p_project_id UUID,
    p_admin_id UUID,
    p_action VARCHAR(20),
    p_message TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update project status
    UPDATE main_projects
    SET 
        approval_status = p_action,
        reviewed_at = NOW(),
        reviewed_by = p_admin_id,
        admin_message = p_message
    WHERE id = p_project_id;

    -- Insert review record
    INSERT INTO project_reviews (project_id, admin_id, action, message)
    VALUES (p_project_id, p_admin_id, p_action, p_message);
END;
$$;

-- Step 7: Set up notification triggers for project approval
CREATE OR REPLACE FUNCTION notify_project_approval()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Only trigger when approval_status changes
    IF OLD.approval_status IS DISTINCT FROM NEW.approval_status THEN
        -- This will be handled by the application layer
        -- Application will send emails and notifications based on the status change
        RAISE NOTICE 'Project % status changed from % to %', NEW.id, OLD.approval_status, NEW.approval_status;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER project_approval_notification
    AFTER UPDATE ON main_projects
    FOR EACH ROW
    WHEN (OLD.approval_status IS DISTINCT FROM NEW.approval_status)
    EXECUTE FUNCTION notify_project_approval();

-- Step 8: Create view for pending projects (admin dashboard)
CREATE OR REPLACE VIEW pending_projects AS
SELECT 
    p.*,
    u.full_name as creator_name,
    u.email as creator_email,
    u.profile_pic as creator_profile_pic
FROM main_projects p
JOIN users u ON p.user_id = u.id
WHERE p.approval_status = 'pending'
ORDER BY p.created_at ASC;

-- Step 9: Create view for admin statistics
CREATE OR REPLACE VIEW admin_stats AS
SELECT 
    COUNT(*) FILTER (WHERE approval_status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE approval_status = 'approved') as approved_count,
    COUNT(*) FILTER (WHERE approval_status = 'rejected') as rejected_count,
    COUNT(*) FILTER (WHERE approval_status = 'paused') as paused_count,
    COUNT(*) FILTER (WHERE approval_status = 'removed') as removed_count,
    COUNT(*) as total_projects
FROM main_projects;

-- Step 10: Update existing projects to 'approved' status (migration for existing data)
UPDATE main_projects 
SET approval_status = 'approved', reviewed_at = NOW()
WHERE approval_status IS NULL OR approval_status = 'pending';

COMMENT ON TABLE project_reviews IS 'Stores history of all admin actions on projects';
COMMENT ON COLUMN main_projects.approval_status IS 'Current approval status: pending (default), approved, rejected, paused, removed';
COMMENT ON COLUMN main_projects.admin_message IS 'Message from admin explaining rejection or removal';
COMMENT ON COLUMN users.is_admin IS 'Flag indicating if user has admin privileges';
