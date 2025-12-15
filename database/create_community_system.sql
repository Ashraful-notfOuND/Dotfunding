-- Community System for Projects
-- Enables project-specific discussion, polls, and interactions

-- ==========================================
-- 1. COMMUNITY POSTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES main_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL DEFAULT 'post', -- 'post', 'poll', or 'question'
  title TEXT NOT NULL,
  content TEXT,
  
  -- Q&A specific
  is_answered BOOLEAN DEFAULT false,
  
  -- Poll-specific fields
  poll_options JSONB, -- Array of poll options: [{"id": 1, "text": "Option 1"}, ...]
  poll_multiple_choice BOOLEAN DEFAULT false,
  poll_ends_at TIMESTAMP WITH TIME ZONE,
  
  -- Moderation
  is_pinned BOOLEAN DEFAULT false,
  is_locked BOOLEAN DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),, 'question'
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_post_type CHECK (type IN ('post', 'poll'))
);

CREATE INDEX idx_community_posts_project ON community_posts(project_id, created_at DESC);
CREATE INDEX idx_community_posts_user ON community_posts(user_id);
CREATE INDEX idx_community_posts_pinned ON community_posts(project_id, is_pinned, created_at DESC);

-- ==========================================
-- 2. COMMUNITY COMMENTS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  
  -- One-level nesting only
  parent_comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_community_comments_post ON community_comments(post_id, created_at ASC);
CREATE INDEX idx_community_comments_user ON community_comments(user_id);
CREATE INDEX idx_community_comments_parent ON community_comments(parent_comment_id);

-- ==========================================
-- 3. COMMUNITY REACTIONS TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS community_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Can react to either post or comment
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES community_comments(id) ON DELETE CASCADE,
  
  reaction_type VARCHAR(20) NOT NULL DEFAULT 'like', -- 'like', 'upvote'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User can only react once per item
  CONSTRAINT unique_user_post_reaction UNIQUE (user_id, post_id),
  CONSTRAINT unique_user_comment_reaction UNIQUE (user_id, comment_id),
  CONSTRAINT reaction_target CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR 
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

CREATE INDEX idx_community_reactions_post ON community_reactions(post_id);
CREATE INDEX idx_community_reactions_comment ON community_reactions(comment_id);
CREATE INDEX idx_community_reactions_user ON community_reactions(user_id);

-- ==========================================
-- 4. POLL VOTES TABLE
-- ==========================================
CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  option_id INTEGER NOT NULL, -- References poll_options array index
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- User can vote once per poll (unless multiple choice)
  CONSTRAINT unique_user_poll_vote UNIQUE (post_id, user_id, option_id)
);

CREATE INDEX idx_poll_votes_post ON poll_votes(post_id);
CREATE INDEX idx_poll_votes_user ON poll_votes(user_id);

-- ==========================================
-- 5. HELPER FUNCTIONS
-- ==========================================

-- Function to get reaction count for a post
CREATE OR REPLACE FUNCTION get_post_reaction_count(post_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM community_reactions WHERE post_id = post_uuid;
$$ LANGUAGE SQL STABLE;

-- Function to get comment count for a post
CREATE OR REPLACE FUNCTION get_post_comment_count(post_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER FROM community_comments WHERE post_id = post_uuid;
$$ LANGUAGE SQL STABLE;

-- Function to check if user has backed a project
CREATE OR REPLACE FUNCTION is_project_backer(user_uuid UUID, project_uuid UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM pledges 
    WHERE user_id = user_uuid 
    AND project_id = project_uuid 
    AND status = 'paid'
  );
$$ LANGUAGE SQL STABLE;

-- ==========================================
-- 6. COMMENTS
-- ==========================================

COMMENT ON TABLE community_posts IS 'Project-specific community posts and polls';
COMMENT ON TABLE community_comments IS 'Comments on community posts (one-level nesting)';
COMMENT ON TABLE community_reactions IS 'Likes/, poll, or question (Q&A)';
COMMENT ON COLUMN community_posts.is_answered IS 'For questions - marked by creator when answeredon posts and comments';
COMMENT ON TABLE poll_votes IS 'User votes on poll options';

COMMENT ON COLUMN community_posts.type IS 'post or poll';
COMMENT ON COLUMN community_posts.is_pinned IS 'Pinned by creator to top of list';
COMMENT ON COLUMN community_posts.is_locked IS 'Locked by creator - no new comments allowed';
COMMENT ON COLUMN community_comments.parent_comment_id IS 'For replies - null for top-level comments';

-- ==========================================
-- 7. VERIFY INSTALLATION
-- ==========================================

SELECT 'Community system tables created successfully!' AS status;

SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_name IN (
  'community_posts',
  'community_comments', 
  'community_reactions',
  'poll_votes'
)
ORDER BY table_name;
