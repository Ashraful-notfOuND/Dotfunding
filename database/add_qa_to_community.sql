-- Migration: Add Q&A feature to Community System
-- Run this if you already ran create_community_system.sql

-- Add is_answered column for Q&A posts
ALTER TABLE community_posts 
ADD COLUMN IF NOT EXISTS is_answered BOOLEAN DEFAULT false;

-- Update the type constraint to include 'question'
ALTER TABLE community_posts 
DROP CONSTRAINT IF EXISTS valid_post_type;

ALTER TABLE community_posts 
ADD CONSTRAINT valid_post_type CHECK (type IN ('post', 'poll', 'question'));

-- Add index for questions
CREATE INDEX IF NOT EXISTS idx_community_posts_questions 
ON community_posts(project_id, type, is_answered, created_at DESC) 
WHERE type = 'question';

-- Update comments
COMMENT ON COLUMN community_posts.type IS 'post, poll, or question (Q&A)';
COMMENT ON COLUMN community_posts.is_answered IS 'For questions - marked by creator when answered';

SELECT 'Q&A feature added to community system!' AS status;
