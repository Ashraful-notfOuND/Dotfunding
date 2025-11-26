-- Create notification_preferences table to store user notification settings

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  pledge_notifications BOOLEAN DEFAULT true,
  comment_notifications BOOLEAN DEFAULT true,
  update_notifications BOOLEAN DEFAULT true,
  recommendation_notifications BOOLEAN DEFAULT true,
  milestone_notifications BOOLEAN DEFAULT true,
  campaign_ending_notifications BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Add comment
COMMENT ON TABLE notification_preferences IS 'Stores user notification channel and activity preferences';
