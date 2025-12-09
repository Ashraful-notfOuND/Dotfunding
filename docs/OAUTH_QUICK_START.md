# Quick Start - OAuth Setup

## 1. Add Environment Variables

**Frontend (.env):**
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 2. Configure Supabase

### Google Provider:
- Get Client ID/Secret from [Google Cloud Console](https://console.cloud.google.com/)
- Enable in Supabase Dashboard → Authentication → Providers → Google

### GitHub Provider:
- Get Client ID/Secret from [GitHub Settings](https://github.com/settings/developers)
- Enable in Supabase Dashboard → Authentication → Providers → GitHub

## 3. Set Redirect URLs

In **Supabase Dashboard → Authentication → URL Configuration**:
- Site URL: `http://localhost:8080` (dev) or `https://yourdomain.com` (prod)
- Redirect URLs: `http://localhost:8080/auth/callback`

In **Google Cloud Console → Credentials**:
- Authorized redirect URI: `https://[project-ref].supabase.co/auth/v1/callback`

In **GitHub OAuth App Settings**:
- Authorization callback URL: `https://[project-ref].supabase.co/auth/v1/callback`

## 4. Allow NULL Passwords (for OAuth users)

Run in Supabase SQL Editor:
```sql
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
```

## 5. Start Your Application

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## 6. Test

Navigate to `http://localhost:8080/login` and click Google or GitHub buttons!

## Files Modified/Created:

✅ `frontend/src/lib/supabase.ts` - Supabase client
✅ `frontend/src/pages/Login.tsx` - Added OAuth buttons (Google & GitHub)
✅ `frontend/src/pages/AuthCallback.tsx` - OAuth callback handler
✅ `frontend/src/App.tsx` - Added callback route
✅ `backend/src/controllers/userController.js` - Added oauthLogin endpoint
✅ `backend/src/routes/userRoutes.js` - Added OAuth route

For detailed instructions, see [OAUTH_SETUP.md](./OAUTH_SETUP.md)
