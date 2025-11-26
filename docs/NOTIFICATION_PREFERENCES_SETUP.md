# Notification Preferences Setup Guide

This guide will help you set up the notification preferences system so users can control email and push notifications.

## ✅ Already Completed

1. **Backend notification preference checking** - All 3 notification creation points now check user preferences
2. **Backend API routes** - GET and POST endpoints for preferences
3. **Frontend integration** - NotificationSettings.tsx now uses backend API instead of localStorage
4. **Database migration file** - `create_notification_preferences.sql` ready to run

## 🔧 Setup Steps

### Step 1: Run Database Migration

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Click on "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy the contents of `backend/database/create_notification_preferences.sql`
6. Paste into the SQL editor
7. Click "Run" button

**Expected Result:** 
- `notification_preferences` table created
- Index on `user_id` created
- All boolean columns default to `true`
- Unique constraint on `user_id`

### Step 2: Verify Table Creation

Run this query in Supabase SQL Editor:
```sql
SELECT * FROM notification_preferences LIMIT 5;
```

Should return empty result (no error) - this confirms table exists.

### Step 3: Test Notification Preferences

#### A. Disable Email Notifications
1. Log into your application
2. Go to Profile → Settings → Notification Settings
3. Toggle OFF "Email Notifications"
4. Click "Save Preferences"
5. Backend creates entry in `notification_preferences` with `email_enabled = false`

#### B. Make a Test Payment
1. Go to any project
2. Make a pledge with backer message
3. Complete payment via SSLCommerz

#### C. Verify Behavior
**Expected:**
- ✅ In-app notification SHOULD appear in notification center
- ❌ Email SHOULD NOT be sent to creator
- 📋 Backend logs should show: `"Email notification skipped - user disabled email notifications"`

Check backend console for this log message.

### Step 4: Test Individual Activity Toggles

1. Toggle OFF "New Pledge" in notification settings
2. Save preferences
3. Make another test payment

**Expected:**
- ❌ NO in-app notification
- ❌ NO email notification
- 📋 Backend logs: Nothing (notification creation skipped entirely)

### Step 5: Verify Preference Persistence

1. Toggle settings to custom configuration
2. Click Save
3. Refresh the page
4. Go back to Notification Settings

**Expected:** All your custom toggles should be preserved (loaded from database)

## 🧪 Testing Checklist

- [ ] Database migration runs without errors
- [ ] Can query `notification_preferences` table in Supabase
- [ ] NotificationSettings page loads without errors
- [ ] Toggles save successfully (no error toast)
- [ ] Settings persist after page refresh
- [ ] Email disabled = no emails sent (check logs)
- [ ] Push disabled = no in-app notifications (check logs)
- [ ] Pledge notifications disabled = no notifications at all
- [ ] All toggles work independently

## 🔍 How It Works

### Backend Flow (paymentController.js)

```javascript
// 1. Fetch user preferences
const { data: prefs } = await supabase
  .from("notification_preferences")
  .select("*")
  .eq("user_id", project.user_id)
  .single();

// 2. Check flags (default true if no preferences)
const wantsPledgeNotif = prefs ? prefs.pledge_notifications : true;
const wantsEmail = prefs ? prefs.email_enabled : true;

// 3. Conditionally create in-app notification
if (wantsPledgeNotif) {
  await supabase.from("notifications").insert([{...}]);
}

// 4. Conditionally send email
if (creator?.email && wantsEmail && wantsPledgeNotif) {
  await EmailService.sendPledgeNotification({...});
} else if (!wantsEmail) {
  console.log('Email notification skipped - user disabled email notifications');
}
```

This pattern is applied in:
- `validatePayment()` - Line ~305
- `successHandler()` - Line ~545
- `ipnHandler()` - Line ~800

### Frontend Flow (NotificationSettings.tsx)

```typescript
// 1. Load preferences on mount
useEffect(() => {
  fetch(`http://localhost:5000/api/notifications/preferences/${user.id}`)
    .then(res => res.json())
    .then(data => setPreferences({
      emailNotifications: data.email_enabled,
      pushNotifications: data.push_enabled,
      newPledge: data.pledge_notifications,
      // ... etc
    }));
}, [user?.id]);

// 2. Save preferences
const handleSave = async () => {
  await fetch('http://localhost:5000/api/notifications/preferences', {
    method: 'POST',
    body: JSON.stringify({
      userId: user.id,
      email_enabled: preferences.emailNotifications,
      pledge_notifications: preferences.newPledge,
      // ... etc
    })
  });
};
```

## 📊 Database Schema

```sql
notification_preferences (
  id UUID PRIMARY KEY
  user_id UUID UNIQUE           -- Links to users table
  email_enabled BOOLEAN          -- Master toggle for emails
  push_enabled BOOLEAN           -- Master toggle for push
  pledge_notifications BOOLEAN   -- New pledges
  comment_notifications BOOLEAN  -- Comments (future)
  update_notifications BOOLEAN   -- Project updates (future)
  recommendation_notifications BOOLEAN
  milestone_notifications BOOLEAN
  campaign_ending_notifications BOOLEAN
  created_at TIMESTAMP
  updated_at TIMESTAMP
)
```

## 🐛 Troubleshooting

### Issue: "Cannot insert into notification_preferences"
**Solution:** Run the database migration first (Step 1)

### Issue: Preferences don't save
**Check:**
1. Backend console for errors
2. Network tab in browser DevTools
3. Verify user is logged in (`user?.id` exists)

### Issue: Emails still sending when disabled
**Check:**
1. Backend logs for "Email notification skipped" message
2. Verify preferences were saved: Query in Supabase:
   ```sql
   SELECT * FROM notification_preferences WHERE user_id = 'YOUR_USER_ID';
   ```
3. Restart backend server if preferences table was just created

### Issue: Frontend shows old localStorage values
**Solution:** Clear localStorage:
```javascript
// In browser console
localStorage.clear();
```
Then refresh page - should load from database.

## 📝 Notes

- **Default behavior:** If user has no preferences in database, everything defaults to `true` (all notifications enabled)
- **Upsert logic:** Backend uses Supabase upsert to create or update preferences
- **Unique constraint:** Each user can only have one preferences row
- **Cascading delete:** If user account deleted, preferences automatically deleted

## 🎯 Next Steps

After verifying preferences work:
1. Setup Gmail App Password for email sending (see EMAIL_SETUP.md)
2. Test with real email notifications
3. Consider adding more activity types (comments, updates, etc.)
4. Add preference toggles for push notification frequency
