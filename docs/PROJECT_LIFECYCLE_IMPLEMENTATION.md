# Project Lifecycle State Machine Implementation

## Overview

This implementation adds a complete project lifecycle management system to the crowdfunding platform using a **State Machine pattern**. Projects now have three distinct states and automatic state transitions based on funding deadlines and goals.

---

## 🎯 Project States

### **LIVE** 🟡
- **Condition**: `now < fundingDeadline`
- **Behavior**:
  - Funding is open
  - Backers can pledge
  - Community is active
  - Countdown timer running
  - "Back this project" button enabled

### **ENDED_SUCCESS** 🔵
- **Condition**: `now >= fundingDeadline AND currentAmount >= fundingGoal`
- **Behavior**:
  - ❌ No more backing allowed
  - ✅ Funding goal reached
  - Payments captured
  - Creator can proceed to fulfillment
  - UI shows "Successfully Funded!" badge

### **ENDED_FAILED** 🔴
- **Condition**: `now >= fundingDeadline AND currentAmount < fundingGoal`
- **Behavior**:
  - ❌ No backing allowed
  - ❌ Funding goal NOT reached
  - No money captured / refunds issued
  - UI shows "Campaign Ended" badge

---

## 🗄️ Database Changes

### Migration File
**Location**: `/database/add_project_status.sql`

```sql
-- Creates enum type for project status
CREATE TYPE project_status AS ENUM ('LIVE', 'ENDED_SUCCESS', 'ENDED_FAILED');

-- Adds status column to main_projects table
ALTER TABLE main_projects 
ADD COLUMN IF NOT EXISTS status project_status DEFAULT 'LIVE';

-- Creates index for efficient querying
CREATE INDEX IF NOT EXISTS idx_main_projects_status ON main_projects(status);
```

### Running the Migration

```bash
# Option 1: Supabase Dashboard
1. Go to SQL Editor in Supabase
2. Copy contents of database/add_project_status.sql
3. Run the SQL

# Option 2: psql command line
psql $DATABASE_URL < database/add_project_status.sql
```

---

## 🔧 Backend Implementation

### 1. Project State Machine Service

**File**: `/backend/src/services/ProjectStateMachine.js`

**Key Features**:
- ✅ **Lazy Evaluation**: Status is evaluated when project is accessed
- ✅ **Automatic Transitions**: Updates status based on deadline and funding
- ✅ **Notifications**: Sends notifications to creator on state changes
- ✅ **Batch Updates**: Can update all expired projects at once

**Main Methods**:

```javascript
// Evaluate and update a single project's status
await projectStateMachine.evaluateAndUpdateStatus(projectId);

// Check if project can accept pledges
const canPledge = await projectStateMachine.canAcceptPledges(projectId);

// Get current status
const status = await projectStateMachine.getProjectStatus(projectId);

// Batch update all projects (cron job)
await projectStateMachine.batchUpdateProjectStatuses();
```

### 2. Payment Controller Updates

**File**: `/backend/src/controllers/paymentController.js`

**Changes**:
- ✅ Evaluates project status before accepting pledges
- ✅ Blocks pledges to non-LIVE projects
- ✅ Returns clear error messages for ended projects

```javascript
// In initPayment()
const projectStatus = await projectStateMachine.evaluateAndUpdateStatus(body.project_id);

if (projectStatus !== ProjectStatus.LIVE) {
  return res.status(403).json({ 
    error: "Funding closed",
    message: "This project is no longer accepting pledges."
  });
}
```

### 3. Project Controller Updates

**File**: `/backend/src/controllers/projectController.js`

**New Endpoints**:

```javascript
// Get project status
GET /api/projects/:id/status
Response: {
  projectId: string,
  status: "LIVE" | "ENDED_SUCCESS" | "ENDED_FAILED",
  canAcceptPledges: boolean
}

// Batch update all projects (admin/cron)
POST /api/projects/batch-update-status
Response: {
  message: string,
  total: number,
  evaluated: number,
  updated: number
}
```

**Modified Endpoint**:
- `GET /api/projects/:id` - Now includes `status` field and auto-evaluates on load

### 4. Routes Updated

**File**: `/backend/src/routes/projectRoutes.js`

```javascript
router.get("/:id/status", getProjectStatus);
router.post("/batch-update-status", batchUpdateProjectStatuses);
```

---

## 🎨 Frontend Implementation

### 1. Project Detail Page

**File**: `/frontend/src/pages/ProjectDetail.tsx`

**Changes**:
- ✅ Added `ProjectStatus` type for type safety
- ✅ Status-aware pledge button
- ✅ Visual status badges for ended projects
- ✅ Conditional rendering based on project state

**Status Badge Display**:
```tsx
{/* Shows success or failure badge for ended projects */}
{project.status === 'ENDED_SUCCESS' && (
  <Card className="border-2 border-green-500">
    <CardContent>
      🎉 Successfully Funded!
    </CardContent>
  </Card>
)}
```

**Pledge Button States**:
```tsx
{project.status === 'LIVE' ? (
  <Button onClick={openPledgeModal}>Back this project</Button>
) : (
  <Button disabled variant="secondary">
    {status === 'ENDED_SUCCESS' ? '✓ Funding Successful' : '✗ Funding Closed'}
  </Button>
)}
```

### 2. Funding Stats Component

**File**: `/frontend/src/components/FundingStats.tsx`

**Changes**:
- ✅ Shows "Campaign Ended" message when `daysLeft === 0`
- ✅ Stops countdown timer for ended projects
- ✅ Visual distinction for expired campaigns

---

## 🔄 State Transition Flow

```
Project Created
     ↓
  [LIVE] ← Default status
     ↓
  Deadline passes
     ↓
  System evaluates:
     ├─ fundingCurrent >= fundingGoal? → [ENDED_SUCCESS]
     └─ fundingCurrent < fundingGoal?  → [ENDED_FAILED]
```

### Lazy Evaluation Strategy

The system uses **lazy evaluation** instead of scheduled cron jobs:

1. **On Project Access**: Status is evaluated when project is loaded
2. **On Pledge Attempt**: Status is checked before accepting pledge
3. **Optional Batch Update**: Can be called periodically via API

**Why Lazy Evaluation?**
- ✅ No need for cron job setup
- ✅ Always accurate when it matters (during user interaction)
- ✅ Lower server load (only evaluate active projects)
- ✅ Simpler deployment

---

## 🚀 Usage Examples

### Backend

```javascript
// Check if project can accept pledges
const canPledge = await projectStateMachine.canAcceptPledges(projectId);
if (!canPledge) {
  return res.status(403).json({ error: "Project is not accepting pledges" });
}

// Get project with updated status
const project = await getProjectById(projectId);
// Status is automatically evaluated and updated

// Manual batch update (optional - can be called by cron or admin)
await projectStateMachine.batchUpdateProjectStatuses();
```

### Frontend

```typescript
// Fetch project (status is automatically evaluated by backend)
const response = await fetch(`/api/projects/${id}`);
const { project } = await response.json();

// Check status
if (project.status === 'LIVE') {
  // Show pledge button
} else if (project.status === 'ENDED_SUCCESS') {
  // Show success badge
} else {
  // Show failure message
}
```

---

## 🧪 Testing

### Manual Testing Steps

1. **Create a test project** with a very close deadline (e.g., 1 day)
2. **Access the project page** - verify it shows as LIVE
3. **Make pledges** - should work normally
4. **Wait for deadline to pass** (or manually update in database)
5. **Refresh project page** - status should auto-update
6. **Try to pledge** - should be blocked with clear error message

### Database Testing

```sql
-- View all project statuses
SELECT id, title, status, funding_goal, funding_deadline 
FROM main_projects 
ORDER BY status;

-- Manually test status transition
UPDATE main_projects 
SET funding_deadline = NOW() - INTERVAL '1 day'
WHERE id = 'test-project-id';

-- Then access the project to trigger evaluation
```

### API Testing

```bash
# Get project status
curl http://localhost:5000/api/projects/{id}/status

# Trigger batch update
curl -X POST http://localhost:5000/api/projects/batch-update-status

# Try to pledge to ended project (should fail)
curl -X POST http://localhost:5000/api/payments/init \
  -H "Content-Type: application/json" \
  -d '{"project_id": "ended-project-id", "user_id": "user-id", ...}'
```

---

## 📋 Migration Checklist

- [x] Run database migration for `status` column
- [x] Backend: ProjectStateMachine service implemented
- [x] Backend: Payment validation updated
- [x] Backend: Project endpoints updated
- [x] Frontend: ProjectDetail page updated
- [x] Frontend: FundingStats component updated
- [x] Testing: Manual verification completed
- [ ] Production: Run migration on production database
- [ ] Monitoring: Set up alerts for failed state transitions

---

## 🎯 Key Benefits

1. **Security**: No pledges after deadline - enforced at backend
2. **UX**: Clear visual feedback on project status
3. **Accuracy**: Lazy evaluation ensures status is always current
4. **Performance**: Efficient with indexes and minimal overhead
5. **Maintainability**: Clean state machine pattern
6. **Scalability**: Batch updates available if needed

---

## 🔍 Troubleshooting

### Status not updating?
- Check that migration ran successfully
- Verify `funding_deadline` is set on project
- Check backend logs for evaluation errors

### Can still pledge to ended project?
- Verify payment controller has state machine checks
- Check that status field is being returned from API
- Ensure frontend is using latest code

### Performance issues?
- Add database index on status column (done in migration)
- Consider batch update for large number of expired projects
- Monitor evaluation logs for slow queries

---

## 📚 Related Files

### Backend
- `/backend/src/services/ProjectStateMachine.js` - State machine logic
- `/backend/src/controllers/paymentController.js` - Payment validation
- `/backend/src/controllers/projectController.js` - Status endpoints
- `/backend/src/routes/projectRoutes.js` - API routes

### Frontend  
- `/frontend/src/pages/ProjectDetail.tsx` - Main project page
- `/frontend/src/components/FundingStats.tsx` - Funding statistics
- `/frontend/src/components/PledgeModal.tsx` - Pledge modal (already has owner check)

### Database
- `/database/add_project_status.sql` - Migration script

### Documentation
- `/docs/PROJECT_LIFECYCLE_IMPLEMENTATION.md` - This file

---

## 🎉 Summary

The project lifecycle state machine is now fully implemented! Projects automatically transition between LIVE, ENDED_SUCCESS, and ENDED_FAILED states. The system prevents backing after deadlines, provides clear user feedback, and maintains data integrity throughout the project lifecycle.

All existing features remain intact while adding robust lifecycle management to the platform.
