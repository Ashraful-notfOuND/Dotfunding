-- Database Schema for Dynamic Recommendation & Notification System

-- 1. User Interests Table
CREATE TABLE IF NOT EXISTS user_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, category)
);

CREATE INDEX idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX idx_user_interests_category ON user_interests(category);

-- 2. Project Subscriptions Table (for Observer Pattern)
CREATE TABLE IF NOT EXISTS project_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES main_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notify_on_update BOOLEAN DEFAULT TRUE,
  notify_on_milestone BOOLEAN DEFAULT TRUE,
  notify_on_comment BOOLEAN DEFAULT TRUE,
  channels JSONB DEFAULT '["in-app"]'::JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX idx_project_subscriptions_project_id ON project_subscriptions(project_id);
CREATE INDEX idx_project_subscriptions_user_id ON project_subscriptions(user_id);

-- 3. Add notification_preferences column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "channels": ["in-app"],
  "frequency": "instant",
  "quiet_hours": {
    "enabled": false,
    "start": "22:00",
    "end": "08:00"
  }
}'::JSONB;

-- 4. Extend notifications table for new types
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'general',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::JSONB,
ADD COLUMN IF NOT EXISTS priority VARCHAR(20) DEFAULT 'normal',
ADD COLUMN IF NOT EXISTS channel VARCHAR(20) DEFAULT 'in-app';

CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_priority ON notifications(priority);

-- 5. Add tracking columns to main_projects for trending calculation
ALTER TABLE main_projects
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_trending_update TIMESTAMP DEFAULT NOW();

CREATE INDEX idx_main_projects_view_count ON main_projects(view_count);
CREATE INDEX idx_main_projects_category ON main_projects(category);

-- 6. Recommendation History Table (for analytics)
CREATE TABLE IF NOT EXISTS recommendation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES main_projects(id) ON DELETE CASCADE,
  strategy VARCHAR(50) NOT NULL,
  shown_at TIMESTAMP DEFAULT NOW(),
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMP
);

CREATE INDEX idx_recommendation_history_user_id ON recommendation_history(user_id);
CREATE INDEX idx_recommendation_history_project_id ON recommendation_history(project_id);
CREATE INDEX idx_recommendation_history_strategy ON recommendation_history(strategy);

-- 7. Sample data for testing

-- Insert sample interests
INSERT INTO user_interests (user_id, category) VALUES
  ((SELECT id FROM users LIMIT 1), 'Technology'),
  ((SELECT id FROM users LIMIT 1), 'Art')
ON CONFLICT (user_id, category) DO NOTHING;

-- Comments for documentation
COMMENT ON TABLE user_interests IS 'Stores user interest categories for personalized recommendations';
COMMENT ON TABLE project_subscriptions IS 'Manages user subscriptions to project updates (Observer pattern)';
COMMENT ON TABLE recommendation_history IS 'Tracks recommendation impressions and clicks for analytics';
COMMENT ON COLUMN users.notification_preferences IS 'JSONB field storing user notification channel and frequency preferences';
COMMENT ON COLUMN notifications.type IS 'Type of notification: general, recommendation, milestone, update, etc.';
COMMENT ON COLUMN notifications.metadata IS 'Additional data for the notification (project details, formatting, etc.)';
