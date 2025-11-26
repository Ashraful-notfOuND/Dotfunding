# Email Notification Setup Instructions

## Required Environment Variables

Add these to your `.env` file in the backend directory:

```env
# Email Configuration for Notifications
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
FRONTEND_URL=http://localhost:8080
```

## Gmail Setup Instructions

### Option 1: Using Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication**
   - Go to your Google Account: https://myaccount.google.com/
   - Navigate to Security > 2-Step Verification
   - Enable it if not already enabled

2. **Generate App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Select "Mail" and "Other (Custom name)"
   - Name it "DotFunding Notifications"
   - Click Generate
   - Copy the 16-character password (remove spaces)
   - Use this as `EMAIL_PASSWORD` in your .env file

3. **Update .env file**
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=youremail@gmail.com
   EMAIL_PASSWORD=your-16-char-app-password
   ```

### Option 2: Using Other Email Services

#### SendGrid
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

#### Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=postmaster@your-domain.mailgun.org
EMAIL_PASSWORD=your-mailgun-password
```

#### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
```

## Install Required Package

Run this in your backend directory:
```bash
npm install nodemailer
```

## Testing Email Configuration

After setting up, restart your backend server. The email service will automatically test the connection on startup.

## Email Features

When a backer pledges to a project, the creator will receive:

✅ **In-App Notification** - Shows in the profile notifications tab
✅ **Email Notification** - Beautiful HTML email with:
   - Pledge amount
   - Backer's name
   - Backer's message (if provided)
   - Project title
   - Direct link to view all notifications

## Security Notes

- **Never commit your .env file** - It's already in .gitignore
- Use App Passwords for Gmail (not your actual password)
- For production, use a professional email service (SendGrid, Mailgun, AWS SES)
- Keep your EMAIL_PASSWORD secure

## Troubleshooting

**Email not sending?**
1. Check backend console logs for connection errors
2. Verify your email credentials are correct
3. Make sure 2FA is enabled for Gmail
4. Check if your app password has spaces (remove them)
5. Try a different SMTP port (465 for secure connections)

**Gmail blocking sign-ins?**
- Make sure you're using an App Password, not your regular password
- Check https://myaccount.google.com/lesssecureapps (might be disabled)
