-- Create project analytics tracking tables
-- Track project views, unique visitors, and engagement metrics

-- Project Views Table - tracks every view
CREATE TABLE IF NOT EXISTS project_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES main_projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- NULL for anonymous viewers
  ip_address VARCHAR(45), -- Store IP for unique visitor tracking (IPv4 or IPv6)
  user_agent TEXT, -- Browser/device info
  referrer TEXT, -- Where the visitor came from
  viewed_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_project_views_project_id ON project_views(project_id);
CREATE INDEX IF NOT EXISTS idx_project_views_user_id ON project_views(user_id);
CREATE INDEX IF NOT EXISTS idx_project_views_ip ON project_views(ip_address);
CREATE INDEX IF NOT EXISTS idx_project_views_date ON project_views(viewed_at DESC);

-- Enable RLS
ALTER TABLE project_views ENABLE ROW LEVEL SECURITY;

-- Policies: Only project creators can view analytics
CREATE POLICY "Project creators can view analytics" ON project_views
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM main_projects WHERE user_id = auth.uid()
    )
  );

-- Policy: Anyone can insert views (for tracking)
CREATE POLICY "Anyone can insert views" ON project_views
  FOR INSERT
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE project_views IS 'Tracks all project page views for analytics';
COMMENT ON COLUMN project_views.user_id IS 'Authenticated user who viewed (NULL for anonymous)';
COMMENT ON COLUMN project_views.ip_address IS 'IP address for unique visitor tracking';
COMMENT ON COLUMN project_views.referrer IS 'Source URL that led to this view (for traffic source analytics)';
