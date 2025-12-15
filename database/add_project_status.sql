-- Add project lifecycle status field
-- This enables proper state machine management for projects

-- Create enum type for project status
DO $$ BEGIN
  CREATE TYPE project_status AS ENUM ('LIVE', 'ENDED_SUCCESS', 'ENDED_FAILED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add status column to main_projects table
ALTER TABLE main_projects 
ADD COLUMN IF NOT EXISTS status project_status DEFAULT 'LIVE';

-- Create index for efficient status queries
CREATE INDEX IF NOT EXISTS idx_main_projects_status ON main_projects(status);

-- Add comment explaining the status field
COMMENT ON COLUMN main_projects.status IS 'Project lifecycle status: LIVE (accepting pledges), ENDED_SUCCESS (goal reached), ENDED_FAILED (goal not reached)';

-- Set default status for existing projects based on deadline
-- Projects with passed deadlines should be evaluated
UPDATE main_projects 
SET status = 'LIVE'
WHERE status IS NULL AND (funding_deadline IS NULL OR funding_deadline > NOW());

-- Verify the changes
SELECT 
  status, 
  COUNT(*) as count 
FROM main_projects 
GROUP BY status;
