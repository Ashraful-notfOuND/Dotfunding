# Admin System Implementation Guide

## Overview
This guide covers the complete admin moderation system implementation for DotFunding. The system allows administrators to review, approve, reject, pause, and remove projects before they go live.

## Features Implemented

### 1. **Database Schema** (`database/admin_system_schema.sql`)
- ✅ Added `is_admin` column to `users` table
- ✅ Added `approval_status`, `reviewed_at`, `reviewed_by`, `admin_message` columns to `main_projects` table
- ✅ Created `project_reviews` table for audit trail
- ✅ Set up indexes for performance
- ✅ Created database functions and triggers
- ✅ Created views for admin dashboard

**Approval Status Values:**
- `pending` - Default status for new projects (awaiting review)
- `approved` - Project is live and visible to all users
- `rejected` - Project was not approved
- `paused` - Project temporarily hidden from public view
- `removed` - Project permanently removed

### 2. **Backend Implementation**

#### Admin Middleware (`backend/src/middleware/adminAuth.js`)
- `requireAdmin` - Protects admin-only routes
- `checkAdmin` - Non-blocking admin check
- `verifyAdminByEmail` - Email-based admin verification

#### Admin Controller (`backend/src/controllers/adminController.js`)
Endpoints:
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/projects/pending` - Get pending projects
- `GET /api/admin/projects` - Get all projects (with status filter)
- `GET /api/admin/projects/:id/history` - Get review history
- `POST /api/admin/projects/:id/approve` - Approve project
- `POST /api/admin/projects/:id/reject` - Reject project (requires message)
- `POST /api/admin/projects/:id/pause` - Pause live project
- `POST /api/admin/projects/:id/resume` - Resume paused project
- `POST /api/admin/projects/:id/remove` - Remove project (requires message)

**Features:**
- Email notifications to creators on approval/rejection
- Notifications to users interested in project category
- Admin message support for feedback
- Complete audit trail in `project_reviews` table

#### Updated Project Controller
- New projects now created with `approval_status: "pending"`
- `getAllProjects` endpoint filters to show only approved projects
- `getUserProjects` returns all projects (including pending for creator's own view)
- `getProjectById` includes approval status and admin message

### 3. **Frontend Implementation**

#### Admin Dashboard (`frontend/src/pages/AdminDashboard.tsx`)
**Features:**
- Statistics cards showing project counts by status
- Pending review tab with all projects awaiting moderation
- All projects tab with status filtering
- Action buttons for approve/reject/pause/resume/remove
- Visual status badges with icons
- Dialog for admin messages
- Responsive design with better UI

**Admin Actions:**
1. **Approve** - Makes project live, notifies creator & interested users
2. **Reject** - Hides project, requires explanation message
3. **Pause** - Temporarily hides live project
4. **Resume** - Makes paused project live again
5. **Remove** - Permanently removes project, requires explanation

#### Updated Components

**Login Page:**
- Checks user's admin status on login
- Stores `is_admin` flag in localStorage
- Auto-redirects admins to admin dashboard
- Shows "(Admin)" badge in login success message

**Navbar:**
- "Admin Dashboard" button visible only to admins
- Styled with gradient purple-blue background
- Available in both desktop and mobile views

**Auth Hook:**
- Added `isAdmin` field to User interface
- Persists admin status in auth state

### 4. **Email & Notification System**

When a project is **approved**:
1. ✅ Creator receives email and notification
2. ✅ Users interested in the project's category receive notifications
3. ✅ Admin message is included if provided

When a project is **rejected**:
1. ✅ Creator receives detailed email with rejection reason
2. ✅ In-app notification is created
3. ✅ Admin must provide a reason (required field)

When a project is **paused/removed**:
1. ✅ Creator is notified
2. ✅ Admin message explains the action
3. ✅ Review history is maintained

## Setup Instructions

### Step 1: Database Setup

1. Open Supabase Dashboard → SQL Editor
2. Run the SQL from `database/admin_system_schema.sql`
3. Make yourself an admin:
```sql
UPDATE users SET is_admin = TRUE WHERE email = 'your-email@example.com';
```

### Step 2: Backend Setup

The admin routes are already integrated in `backend/src/app.js`:
```javascript
import adminRoutes from "./routes/adminRoutes.js";
app.use("/api/admin", adminRoutes);
```

No additional configuration needed - restart your backend server:
```bash
cd backend
npm start
```

### Step 3: Frontend Setup

The admin route is already added to `frontend/src/App.tsx`:
```tsx
<Route path="/admin" element={<PageWrapper><AdminDashboard /></PageWrapper>} />
```

No additional configuration needed - restart your frontend:
```bash
cd frontend
npm run dev
```

### Step 4: Create Admin User

1. Register a new account or use existing one
2. In Supabase Dashboard, run:
```sql
UPDATE users SET is_admin = TRUE WHERE email = 'admin@example.com';
```
3. Log out and log back in
4. You should see "Admin Dashboard" button in navbar
5. Click it or navigate to `/admin`

## Usage Guide

### For Admins

1. **Login** with your admin account
2. You'll be automatically redirected to `/admin`
3. **Dashboard Overview:**
   - See stats cards showing project counts by status
   - "Pending Review" tab shows projects awaiting moderation
   - "All Projects" tab shows all projects with filters

4. **Review Pending Projects:**
   - Click "Pending Review" tab
   - Each card shows project details and creator info
   - Actions available:
     - ✅ **Approve** - Optional message to creator
     - ❌ **Reject** - Required message explaining why
     - 👁️ **View** - See full project details

5. **Manage Live Projects:**
   - Go to "All Projects" tab
   - Filter by status if needed
   - Actions for approved projects:
     - ⏸️ **Pause** - Temporarily hide project
     - 🗑️ **Remove** - Permanently remove (requires message)

6. **Resume Paused Projects:**
   - Find paused projects in "All Projects"
   - Click ▶️ **Resume** to make them live again

### For Project Creators

1. **Create Project:**
   - Create project normally via "Start a Project"
   - Project is submitted with status: "pending"
   - Message shown: "Project submitted successfully and is pending admin review"

2. **Wait for Review:**
   - Check your notifications for updates
   - Check your email for approval/rejection

3. **If Approved:**
   - Project goes live on explore page
   - You receive congratulations email
   - Category followers are notified

4. **If Rejected:**
   - You receive email with admin's explanation
   - You can revise and resubmit
   - Admin message explains what needs to be fixed

5. **View Your Projects:**
   - Go to Profile → My Projects
   - See all projects including pending ones
   - Status badge shows current state
   - Admin message visible if provided

## Admin Controls

### Power Features

1. **Ultimate Control:**
   - Admins can moderate ANY project at ANY time
   - Can pause/remove even funded projects
   - All actions are logged in `project_reviews` table

2. **Restrictions:**
   - Admins cannot create projects (normal user feature)
   - Admins cannot donate to projects (to avoid conflicts)
   - These restrictions can be removed if needed

3. **Audit Trail:**
   - Every admin action is recorded
   - View history: `GET /api/admin/projects/:id/history`
   - Includes: action type, admin ID, message, timestamp

## API Reference

### Admin Endpoints

All endpoints require `user_id` in query/body with admin privileges.

```bash
# Get dashboard stats
GET /api/admin/stats?user_id=ADMIN_ID

# Get pending projects
GET /api/admin/projects/pending?user_id=ADMIN_ID

# Get all projects
GET /api/admin/projects?user_id=ADMIN_ID&status=pending&limit=50

# Approve project
POST /api/admin/projects/:project_id/approve
Body: { user_id, admin_id, message? }

# Reject project
POST /api/admin/projects/:project_id/reject
Body: { user_id, admin_id, message } // message required

# Pause project
POST /api/admin/projects/:project_id/pause
Body: { user_id, admin_id, message? }

# Resume project
POST /api/admin/projects/:project_id/resume
Body: { user_id, admin_id, message? }

# Remove project
POST /api/admin/projects/:project_id/remove
Body: { user_id, admin_id, message } // message required
```

## Testing the System

1. **Create a test account:**
```sql
INSERT INTO users (email, password, full_name, is_admin)
VALUES ('admin@test.com', 'hashed_password', 'Test Admin', TRUE);
```

2. **Create a test project** (as regular user)
3. **Login as admin** and navigate to `/admin`
4. **Approve/reject** the test project
5. **Check email** and notifications
6. **Verify** project appears/disappears from explore page

## Troubleshooting

### Admin not seeing dashboard?
- Verify `is_admin = TRUE` in database
- Check localStorage for `is_admin` value
- Clear cache and login again

### Projects not filtering?
- Verify `approval_status` column exists
- Check if existing projects have status set
- Run migration in SQL file to update existing projects

### Notifications not sending?
- Check email service configuration
- Verify `user_interests` table has data
- Check server logs for errors

### Actions failing?
- Verify admin middleware is applied
- Check `user_id` is being sent in requests
- Review network tab for error responses

## Security Considerations

1. **Admin Authentication:**
   - Always verify `is_admin` flag in database
   - Don't rely solely on frontend checks
   - Middleware validates on every request

2. **Audit Trail:**
   - All actions logged in `project_reviews`
   - Includes admin ID and timestamp
   - Cannot be deleted (foreign key constraints)

3. **Message Requirements:**
   - Rejection requires explanation
   - Removal requires explanation
   - Helps prevent abuse and provides transparency

## Future Enhancements

Potential additions:
- [ ] Bulk approve/reject functionality
- [ ] Admin roles (super admin, moderator, etc.)
- [ ] Automated spam detection
- [ ] Project quality scoring
- [ ] Admin activity dashboard
- [ ] Email templates customization
- [ ] Scheduled project launches
- [ ] Project revision system

## Summary

The admin system is now fully functional with:
- ✅ Complete database schema
- ✅ Protected backend endpoints
- ✅ Beautiful admin dashboard UI
- ✅ Email & notification system
- ✅ Audit trail & review history
- ✅ Status badges & indicators
- ✅ Mobile-responsive design
- ✅ Ultimate admin control

All projects now require admin approval before going live, preventing spam and maintaining quality on your platform!
