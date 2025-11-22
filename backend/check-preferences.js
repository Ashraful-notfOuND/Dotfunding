// Quick script to check notification preferences in database
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

(async () => {
  console.log('🔍 Checking notification preferences...\n');
  
  const { data, error } = await supabase.from('notification_preferences').select('*');
  
  if (error) {
    console.log('❌ Error:', error.message);
    console.log('💡 Run the SQL migration first: backend/database/create_notification_preferences.sql');
  } else if (data.length === 0) {
    console.log('⚠️  No preferences found in database!');
    console.log('\n📝 Action needed:');
    console.log('1. Open your application');
    console.log('2. Go to Profile → Settings → Notification Settings');
    console.log('3. Toggle OFF "Email Notifications"');
    console.log('4. Click "Save Preferences"');
    console.log('5. Run this script again to verify\n');
  } else {
    console.log('✅ Found preferences:\n');
    data.forEach(pref => {
      console.log(`User ID: ${pref.user_id}`);
      console.log(`  Email enabled: ${pref.email_enabled ? '✅ YES' : '❌ NO'}`);
      console.log(`  Push enabled: ${pref.push_enabled ? '✅ YES' : '❌ NO'}`);
      console.log(`  Pledge notifications: ${pref.pledge_notifications ? '✅ YES' : '❌ NO'}`);
      console.log('');
    });
    
    const disabledEmail = data.find(p => !p.email_enabled);
    if (disabledEmail) {
      console.log('✅ Email notifications are DISABLED for user:', disabledEmail.user_id);
      console.log('🎉 No emails will be sent to this user!');
    } else {
      console.log('⚠️  All users have email notifications ENABLED');
      console.log('💡 To stop emails, disable in Notification Settings');
    }
  }
  
  process.exit(0);
})();
