-- Fix RLS policies for admin operations
-- Run this in Supabase SQL Editor

-- Allow admins to update all columns in main_projects
CREATE POLICY IF NOT EXISTS "Admins can update all project fields"
ON main_projects
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.is_admin = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.is_admin = true
  )
);

-- Allow service role to bypass RLS (if using service role key)
ALTER TABLE main_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_reviews ENABLE ROW LEVEL SECURITY;

-- Allow admins to insert into project_reviews
CREATE POLICY IF NOT EXISTS "Admins can insert project reviews"
ON project_reviews
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.is_admin = true
  )
);

-- Allow admins to read all project reviews
CREATE POLICY IF NOT EXISTS "Admins can read all project reviews"
ON project_reviews
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users 
    WHERE users.id = auth.uid() 
    AND users.is_admin = true
  )
);

-- Temporary: Allow all updates to main_projects for testing
-- WARNING: Remove this after testing!
DROP POLICY IF EXISTS "Allow all updates for testing" ON main_projects;
CREATE POLICY "Allow all updates for testing"
ON main_projects
FOR UPDATE
TO public
USING (true)
WITH CHECK (true);
