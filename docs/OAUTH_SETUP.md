# OAuth Authentication Setup Guide

This guide will help you set up Google and GitHub authentication for your DotFunding application.

## Prerequisites

- Supabase account with a project created
- Google Cloud Console access
- GitHub account

## Step 1: Configure Environment Variables

### Frontend Configuration

Create or update `.env` in the `frontend/` directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

You can find these values in your Supabase Dashboard:
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings > API
4. Copy the "Project URL" and "anon public" key

### Backend Configuration

Your backend already has Supabase configured in `.env`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_service_role_key
```

## Step 2: Configure Google OAuth

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Name it (e.g., "DotFunding OAuth")
   
5. Configure authorized redirect URIs:
   - Add: `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
   - For local development, also add: `http://localhost:54321/auth/v1/callback`
   
6. Save and copy your:
   - Client ID
   - Client Secret

### 2. Configure Google OAuth in Supabase

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Providers
3. Find "Google" and click to expand
4. Enable the provider
5. Paste your Google Client ID and Client Secret
6. Click "Save"

## Step 3: Configure GitHub OAuth

### 1. Create GitHub OAuth App

1. Go to [GitHub Settings](https://github.com/settings/developers)
2. Click "OAuth Apps" in the left sidebar
3. Click "New OAuth App"
4. Fill in the application details:
   - **Application name**: DotFunding
   - **Homepage URL**: `http://localhost:8080` (for development)
   - **Authorization callback URL**: `https://<your-supabase-project-ref>.supabase.co/auth/v1/callback`
5. Click "Register application"
6. Copy your **Client ID**
7. Click "Generate a new client secret" and copy the **Client Secret**

### 2. Configure GitHub OAuth in Supabase

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Providers
3. Find "GitHub" and click to expand
4. Enable the provider
5. Paste your GitHub Client ID and Client Secret
6. Click "Save"

## Step 4: Update Database Schema

The OAuth login endpoint handles user creation automatically, but ensure your `users` table allows NULL passwords for OAuth users:

```sql
-- Run this in your Supabase SQL Editor if needed
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
```

## Step 5: Configure URL Configuration

### Supabase URL Configuration

1. Go to Authentication > URL Configuration in Supabase Dashboard
2. Add your site URL:
   - Production: `https://yourdomain.com`
   - Development: `http://localhost:5173`
3. Add redirect URLs:
   - `http://localhost:5173/auth/callback`
   - `https://yourdomain.com/auth/callback` (for production)

## Step 6: Testing

### Test Google Sign-In

1. Start your frontend: `cd frontend && npm run dev`
2. Start your backend: `cd backend && npm start`
3. Navigate to http://localhost:8080/login
4. Click "Google" button
5. Sign in with your Google account
6. You should be redirected back and logged in

### Test GitHub Sign-In

1. Make sure you're on the login page
2. Click "GitHub" button
3. Authorize the application
4. You should be redirected back and logged in

## Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**
   - Ensure the redirect URI in Google/Facebook matches exactly with Supabase
   - Check that you've added all necessary URLs

2. **"Invalid credentials" error**
   - Verify your Client ID/Secret are correct in Supabase
   - Make sure the provider is enabled in Supabase

3. **User not created in database**
   - Check backend logs for errors
   - Verify the `/api/users/oauth-login` endpoint is accessible
   - Ensure CORS is properly configured

4. **Session not persisting**
   - Check that localStorage is enabled in browser
   - Verify Supabase client configuration in frontend

5. **GitHub authorization issues**
   - Make sure the callback URL in GitHub matches your Supabase URL exactly
   - Check that your GitHub OAuth app is active

### Development vs Production

**Development:**
- Use `http://localhost:8080` for site URL
- Use `http://localhost:54321` for Supabase local instance (if using)

**Production:**
- Update all URLs to your production domain
- Ensure SSL certificates are valid
- Update OAuth app settings in Google/GitHub to use production URLs

## Security Considerations

1. **Never commit credentials**: Keep `.env` files out of version control
2. **Use environment-specific credentials**: Separate dev and prod OAuth apps
3. **Restrict domains**: Only allow your domains in OAuth settings
4. **Monitor usage**: Check OAuth app dashboards for suspicious activity

## Additional Features

### Profile Picture Handling

OAuth providers automatically provide profile pictures:
- Google: `user.user_metadata.avatar_url`
- GitHub: `user.user_metadata.avatar_url`

These are automatically saved in the database during OAuth login.

### Email Verification

OAuth users are pre-verified since the provider confirms the email. You don't need additional email verification for OAuth users.

## Need Help?

- Supabase Auth Docs: https://supabase.com/docs/guides/auth
- Google OAuth Docs: https://developers.google.com/identity/protocols/oauth2
- GitHub OAuth Docs: https://docs.github.com/en/developers/apps/building-oauth-apps

## Summary

After completing these steps:
1. ✅ Frontend has Supabase client configured
2. ✅ Backend has OAuth endpoint ready
3. ✅ Google OAuth is configured
4. ✅ GitHub OAuth is configured
5. ✅ Login page has social sign-in buttons
6. ✅ Callback route handles authentication

Your users can now sign in with Google or GitHub!
