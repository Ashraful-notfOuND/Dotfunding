# Admin System Service Role Key Setup

## Issue
Admin operations (approve/reject/pause/resume/remove projects) were failing with "Cannot coerce the result to a single JSON object" error because the backend was using the anon key which is subject to Row Level Security (RLS) policies.

## Solution
Created a separate Supabase Admin client that uses the **service role key** which bypasses RLS and allows full admin operations.

## What You Need To Do

### Step 1: Get Your Service Role Key
1. Go to your Supabase Dashboard
2. Navigate to: **Project Settings** → **API**
3. Scroll down to **Project API keys**
4. Find the **`service_role` secret** key (NOT the anon/public key!)
5. Copy it

### Step 2: Add It To Your .env File
Open `/backend/.env` and add this line:

```
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

Replace `your-service-role-key-here` with the actual service role key you copied.

### Step 3: Restart The Backend
```bash
cd backend
pkill -f "node src/server.js"
node src/server.js &
```

## What Changed

### Files Created:
- `backend/src/config/supabaseAdmin.js` - Admin client with service role key
- `database/fix_admin_rls.sql` - RLS policies (optional, not needed if using service role)

### Files Modified:
- `backend/src/controllers/adminController.js` - Now uses `supabaseAdmin` for all operations

## Testing
After adding the service role key and restarting:

```bash
curl -X POST http://localhost:5000/api/admin/projects/{PROJECT_ID}/approve \
  -H "Content-Type: application/json" \
  -d '{"user_id":"ADMIN_USER_ID","admin_id":"ADMIN_USER_ID","message":"Approved!"}'
```

You should get a success response!

## Security Note
⚠️ **IMPORTANT**: The service role key bypasses all security rules. NEVER expose it in frontend code or commit it to Git. Only use it in backend code.
