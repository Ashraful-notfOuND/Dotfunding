-- Complete Pattern System Database Schema (CORRECTED FOR SUPABASE)
-- Design Patterns: Observer, Strategy, Factory, Decorator
-- For DotFunding Dynamic Recommendation & Notification System

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==========================================
-- PATTERN SUPPORT TABLES
-- ==========================================

-- 1. User Interests Table (for Strategy Pattern - Interest-Based Recommendations)
CREATE TABLE IF NOT EXISTS user_interests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL,
  weight INTEGER DEFAULT 1, -- Interest strength: higher = more interested
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, category)
);

CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_category ON user_interests(category);
CREATE INDEX IF NOT EXISTS idx_user_interests_weight ON user_interests(weight DESC);

-- 2. Project Subscriptions Table (for Observer Pattern)
CREATE TABLE IF NOT EXISTS project_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES main_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  notify_on_update BOOLEAN DEFAULT TRUE,
  notify_on_milestone BOOLEAN DEFAULT TRUE,
  notify_on_comment BOOLEAN DEFAULT TRUE,
  notify_on_new_pledge BOOLEAN DEFAULT FALSE,
  channels JSONB DEFAULT '["in-app"]'::JSONB, -- Factory Pattern: multiple channels
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_project_subscriptions_project_id ON project_subscriptions(project_id);
CREATE INDEX IF NOT EXISTS idx_project_subscriptions_user_id ON project_subscriptions(user_id);

-- 3. Notification Preferences (for Factory Pattern - Channel Selection)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
  "channels": ["in-app"],
  "frequency": "instant",
  "quiet_hours": {
    "enabled": false,
    "start": "22:00",
    "end": "08:00"
  },
  "recommendations": {
    "enabled": true,
    "frequency": "daily"
  }
}'::JSONB;

-- 4. Enhanced Notifications Table (supports all patterns)
-- Note: Using DO block to handle existing columns gracefully
DO $$ 
BEGIN
  -- Add type column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notifications' AND column_name='type') THEN
    ALTER TABLE notifications ADD COLUMN type VARCHAR(50) DEFAULT 'general';
  END IF;

  -- Add metadata column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notifications' AND column_name='metadata') THEN
    ALTER TABLE notifications ADD COLUMN metadata JSONB DEFAULT '{}'::JSONB;
  END IF;

  -- Add priority column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notifications' AND column_name='priority') THEN
    ALTER TABLE notifications ADD COLUMN priority VARCHAR(20) DEFAULT 'normal';
  END IF;

  -- Add channel column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notifications' AND column_name='channel') THEN
    ALTER TABLE notifications ADD COLUMN channel VARCHAR(20) DEFAULT 'in-app';
  END IF;

  -- Add tracking_id column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notifications' AND column_name='tracking_id') THEN
    ALTER TABLE notifications ADD COLUMN tracking_id VARCHAR(100);
  END IF;

  -- Add personalized column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notifications' AND column_name='personalized') THEN
    ALTER TABLE notifications ADD COLUMN personalized BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add sent_at column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notifications' AND column_name='sent_at') THEN
    ALTER TABLE notifications ADD COLUMN sent_at TIMESTAMP;
  END IF;

  -- Add delivery_status column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='notifications' AND column_name='delivery_status') THEN
    ALTER TABLE notifications ADD COLUMN delivery_status VARCHAR(20) DEFAULT 'pending';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_channel ON notifications(channel);
CREATE INDEX IF NOT EXISTS idx_notifications_tracking_id ON notifications(tracking_id);
CREATE INDEX IF NOT EXISTS idx_notifications_delivery_status ON notifications(delivery_status);

-- 5. Project Metrics (for Strategy Pattern - Trending)
DO $$ 
BEGIN
  -- Add view_count column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='main_projects' AND column_name='view_count') THEN
    ALTER TABLE main_projects ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;

  -- Add pledge_count column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='main_projects' AND column_name='pledge_count') THEN
    ALTER TABLE main_projects ADD COLUMN pledge_count INTEGER DEFAULT 0;
  END IF;

  -- Add last_pledge_at column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='main_projects' AND column_name='last_pledge_at') THEN
    ALTER TABLE main_projects ADD COLUMN last_pledge_at TIMESTAMP;
  END IF;

  -- Add trending_score column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='main_projects' AND column_name='trending_score') THEN
    ALTER TABLE main_projects ADD COLUMN trending_score DECIMAL(10,2) DEFAULT 0;
  END IF;

  -- Add last_trending_update column
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='main_projects' AND column_name='last_trending_update') THEN
    ALTER TABLE main_projects ADD COLUMN last_trending_update TIMESTAMP DEFAULT NOW();
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_main_projects_view_count ON main_projects(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_main_projects_trending_score ON main_projects(trending_score DESC);
CREATE INDEX IF NOT EXISTS idx_main_projects_category ON main_projects(category);
CREATE INDEX IF NOT EXISTS idx_main_projects_last_pledge_at ON main_projects(last_pledge_at DESC);

-- 6. Recommendation History (for Strategy Pattern - Analytics)
CREATE TABLE IF NOT EXISTS recommendation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES main_projects(id) ON DELETE CASCADE,
  strategy VARCHAR(50) NOT NULL, -- interest, trending, collaborative, past-pledge
  score DECIMAL(10,2), -- Recommendation relevance score
  shown_at TIMESTAMP DEFAULT NOW(),
  clicked BOOLEAN DEFAULT FALSE,
  clicked_at TIMESTAMP,
  pledged BOOLEAN DEFAULT FALSE, -- Did user pledge after recommendation?
  pledged_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recommendation_history_user_id ON recommendation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_history_project_id ON recommendation_history(project_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_history_strategy ON recommendation_history(strategy);
CREATE INDEX IF NOT EXISTS idx_recommendation_history_clicked ON recommendation_history(clicked);

-- 7. Notification Logs (for Decorator Pattern - Tracking & Retry)
-- CORRECTED: Using BIGINT for notification_id to match existing notifications table
CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id BIGINT REFERENCES notifications(id) ON DELETE CASCADE,
  tracking_id VARCHAR(100),
  channel VARCHAR(20),
  attempt INTEGER DEFAULT 1,
  status VARCHAR(20), -- pending, sent, delivered, failed
  error_message TEXT,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_notification_id ON notification_logs(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_tracking_id ON notification_logs(tracking_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status);

-- 8. Strategy Performance Metrics
CREATE TABLE IF NOT EXISTS strategy_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strategy VARCHAR(50) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recommendations_shown INTEGER DEFAULT 0,
  recommendations_clicked INTEGER DEFAULT 0,
  recommendations_pledged INTEGER DEFAULT 0,
  avg_relevance_score DECIMAL(10,2),
  date DATE DEFAULT CURRENT_DATE,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(strategy, user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_strategy_metrics_strategy ON strategy_metrics(strategy);
CREATE INDEX IF NOT EXISTS idx_strategy_metrics_date ON strategy_metrics(date DESC);

-- ==========================================
-- FUNCTIONS & TRIGGERS
-- ==========================================

-- Function to update trending score
CREATE OR REPLACE FUNCTION update_trending_score()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE main_projects
  SET 
    pledge_count = pledge_count + 1,
    last_pledge_at = NEW.created_at,
    trending_score = CASE
      WHEN EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400 > 0
      THEN (pledge_count + 1)::DECIMAL / (EXTRACT(EPOCH FROM (NOW() - created_at)) / 86400)
      ELSE pledge_count + 1
    END,
    last_trending_update = NOW()
  WHERE id = NEW.project_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update trending score on new pledge
DROP TRIGGER IF EXISTS trigger_update_trending_score ON pledges;
CREATE TRIGGER trigger_update_trending_score
AFTER INSERT ON pledges
FOR EACH ROW
EXECUTE FUNCTION update_trending_score();

-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(p_project_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE main_projects
  SET view_count = view_count + 1
  WHERE id = p_project_id;
END;
$$ LANGUAGE plpgsql;

-- Function to log recommendation impression
CREATE OR REPLACE FUNCTION log_recommendation(
  p_user_id UUID,
  p_project_id UUID,
  p_strategy VARCHAR,
  p_score DECIMAL
)
RETURNS UUID AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO recommendation_history (user_id, project_id, strategy, score)
  VALUES (p_user_id, p_project_id, p_strategy, p_score)
  RETURNING id INTO v_id;
  
  -- Update strategy metrics
  INSERT INTO strategy_metrics (strategy, user_id, recommendations_shown)
  VALUES (p_strategy, p_user_id, 1)
  ON CONFLICT (strategy, user_id, date)
  DO UPDATE SET 
    recommendations_shown = strategy_metrics.recommendations_shown + 1,
    updated_at = NOW();
  
  RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- ==========================================
-- VIEWS FOR ANALYTICS
-- ==========================================

-- View: Best performing recommendation strategies per user
CREATE OR REPLACE VIEW v_strategy_performance AS
SELECT 
  strategy,
  user_id,
  SUM(recommendations_shown) as total_shown,
  SUM(recommendations_clicked) as total_clicked,
  SUM(recommendations_pledged) as total_pledged,
  CASE 
    WHEN SUM(recommendations_shown) > 0 
    THEN (SUM(recommendations_clicked)::DECIMAL / SUM(recommendations_shown) * 100)
    ELSE 0 
  END as click_rate,
  CASE 
    WHEN SUM(recommendations_clicked) > 0 
    THEN (SUM(recommendations_pledged)::DECIMAL / SUM(recommendations_clicked) * 100)
    ELSE 0 
  END as conversion_rate,
  AVG(avg_relevance_score) as avg_score
FROM strategy_metrics
GROUP BY strategy, user_id;

-- View: Most subscribed projects
CREATE OR REPLACE VIEW v_popular_subscriptions AS
SELECT 
  p.id,
  p.title,
  p.category,
  COUNT(ps.user_id) as subscriber_count,
  AVG(p.trending_score) as avg_trending_score
FROM main_projects p
LEFT JOIN project_subscriptions ps ON p.id = ps.project_id
GROUP BY p.id, p.title, p.category
ORDER BY subscriber_count DESC;

-- View: User engagement with notifications
CREATE OR REPLACE VIEW v_notification_engagement AS
SELECT 
  n.type,
  n.channel,
  n.priority,
  COUNT(*) as sent_count,
  COUNT(CASE WHEN n.is_read THEN 1 END) as read_count,
  CASE 
    WHEN COUNT(*) > 0 
    THEN (COUNT(CASE WHEN n.is_read THEN 1 END)::DECIMAL / COUNT(*) * 100)
    ELSE 0 
  END as read_rate,
  AVG(EXTRACT(EPOCH FROM (COALESCE(n.sent_at, n.created_at) - n.created_at))) as avg_delivery_time_seconds
FROM notifications n
GROUP BY n.type, n.channel, n.priority;

-- ==========================================
-- SAMPLE DATA FOR TESTING
-- ==========================================

-- Insert sample user interests (only if users exist)
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  SELECT id INTO v_user_id FROM users LIMIT 1;
  
  IF v_user_id IS NOT NULL THEN
    INSERT INTO user_interests (user_id, category, weight) VALUES
      (v_user_id, 'Technology', 5),
      (v_user_id, 'Art', 3),
      (v_user_id, 'Music', 4)
    ON CONFLICT (user_id, category) DO NOTHING;
  END IF;
END $$;

-- ==========================================
-- DOCUMENTATION COMMENTS
-- ==========================================

COMMENT ON TABLE user_interests IS 'Strategy Pattern: Stores user interest categories for personalized recommendations with weights';
COMMENT ON TABLE project_subscriptions IS 'Observer Pattern: Manages user subscriptions to project updates';
COMMENT ON TABLE recommendation_history IS 'Strategy Pattern: Tracks recommendation impressions, clicks, and conversions';
COMMENT ON TABLE notification_logs IS 'Decorator Pattern: Logs notification delivery attempts with tracking and retry information';
COMMENT ON TABLE strategy_metrics IS 'Strategy Pattern: Performance metrics for different recommendation strategies';

COMMENT ON COLUMN notifications.type IS 'Type: general, recommendation, milestone, update, pledge, comment';
COMMENT ON COLUMN notifications.metadata IS 'JSONB: Additional data (project details, formatting, personalization)';
COMMENT ON COLUMN notifications.priority IS 'Decorator Pattern: urgent, high, normal, low';
COMMENT ON COLUMN notifications.channel IS 'Factory Pattern: in-app, email, sms, push';
COMMENT ON COLUMN notifications.tracking_id IS 'Decorator Pattern: Unique tracking identifier';
COMMENT ON COLUMN notifications.personalized IS 'Decorator Pattern: Whether message was personalized';

COMMENT ON COLUMN main_projects.trending_score IS 'Strategy Pattern: Calculated score for trending recommendations';
COMMENT ON COLUMN main_projects.pledge_count IS 'Cached count of pledges for performance';

COMMENT ON FUNCTION update_trending_score() IS 'Automatically updates project trending score when new pledge is made';
COMMENT ON FUNCTION log_recommendation(UUID, UUID, VARCHAR, DECIMAL) IS 'Logs a recommendation impression and updates metrics';
COMMENT ON FUNCTION increment_view_count(UUID) IS 'Increments project view count for trending calculation';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Design Pattern Database Schema created successfully!';
  RAISE NOTICE '✅ Patterns implemented: Observer, Strategy, Factory, Decorator';
  RAISE NOTICE '✅ Tables created: user_interests, project_subscriptions, recommendation_history, notification_logs, strategy_metrics';
  RAISE NOTICE '✅ Enhanced: notifications, main_projects, users';
END $$;
