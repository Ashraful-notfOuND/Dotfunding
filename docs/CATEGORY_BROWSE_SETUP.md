# Category Browse Feature - Real Database Integration

## Overview
The "Browse by Category" section has been updated to fetch real project data from your Supabase database via the backend API instead of using dummy data.

## Changes Made

### 1. CategoryPage Component (`frontend/src/pages/Categorypage.tsx`)
- **Removed**: Import of static `allProjects` data
- **Added**: Real-time data fetching from backend API
- **Added**: Loading state with skeleton loaders
- **Added**: Error handling with retry functionality
- **Added**: Better empty state messages

### 2. Environment Configuration
- **Created**: `frontend/.env` with `VITE_BACKEND_URL` variable
- **Created**: `frontend/.env.example` as a template
- Backend URL defaults to `http://localhost:5000` if not specified

### 3. Routing Fix
- **Fixed**: Category links now properly route to `/projects/category/{CategoryName}`
- **Updated**: Case-insensitive category matching

## How It Works

### Data Flow:
```
User clicks category → CategoryPage → Fetch from API → Filter by category → Display
```

### API Endpoint:
```
GET http://localhost:5000/api/projects
```

### Response Format:
```json
{
  "projects": [
    {
      "id": "uuid",
      "title": "Project Title",
      "creator": "Creator Name",
      "image": "https://...",
      "fundingGoal": 50000,
      "fundingCurrent": 42350,
      "daysLeft": 12,
      "category": "Technology",
      "tagline": "Project tagline"
    }
  ]
}
```

## Setup Instructions

### 1. Backend Setup (Already Done)
Your backend is already configured with:
- ✅ Supabase database connection
- ✅ Project controller with `getAllProjects` endpoint
- ✅ Route: `GET /api/projects`

### 2. Frontend Setup

#### Start the Backend:
```bash
cd backend
npm install
npm run dev  # Should run on port 5000
```

#### Start the Frontend:
```bash
cd frontend
npm install
npm run dev  # Should run on port 5173 (Vite default)
```

### 3. Verify Environment Variables

Check `frontend/.env`:
```env
VITE_BACKEND_URL=http://localhost:5000
```

**Note**: For production, update this to your deployed backend URL.

## Database Requirements

### Required Tables:
1. **main_projects** - Stores project data
2. **pledges** - Stores user pledges (for calculating funding_current)
3. **users** - Stores creator information

### Project Categories:
The following categories are available:
- Technology
- Art
- Games
- Design
- Film
- Music
- Fashion

## Features

### ✅ Category Filtering
- Click any category on homepage → See all projects in that category
- Case-insensitive matching (e.g., "technology" matches "Technology")

### ✅ Search Within Category
- Search by project title or creator name
- Real-time filtering
- Clear button to reset search

### ✅ Pagination
- 9 projects per page
- Previous/Next navigation
- Direct page number selection
- Auto-scroll to top on page change

### ✅ Loading States
- Skeleton loaders while fetching data
- Prevents layout shift

### ✅ Error Handling
- Displays error message if API fails
- Retry button to refetch data
- Graceful fallback

## Testing

### Test Category Browsing:
1. Go to homepage: `http://localhost:5173`
2. Scroll to "Browse by Category" section
3. Click any category (e.g., "Technology")
4. Should see: `http://localhost:5173/projects/category/Technology`
5. Projects should load from database

### Test Search:
1. On category page, type in search box
2. Results filter in real-time
3. Click "Clear" to reset

### Test Pagination:
1. If more than 9 projects, pagination appears
2. Click page numbers or Previous/Next
3. Page changes, scrolls to top

## Troubleshooting

### Issue: "Failed to fetch projects"
**Solution**: 
- Check backend is running: `http://localhost:5000/api/projects`
- Verify `VITE_BACKEND_URL` in `.env`
- Check browser console for CORS errors

### Issue: No projects showing
**Solution**:
- Verify database has projects: Check Supabase `main_projects` table
- Ensure projects have `category` field set
- Check browser Network tab for API response

### Issue: Categories not matching
**Solution**:
- Category names must match exactly (case-insensitive)
- Check database: Categories should be: "Technology", "Art", "Games", "Design", "Film", "Music", "Fashion"

## Production Deployment

### Update Environment Variables:

**Frontend** (`.env.production`):
```env
VITE_BACKEND_URL=https://your-backend-domain.com
```

**Backend** (`.env`):
```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
PORT=5000
```

### Build Commands:
```bash
# Backend
cd backend
npm run start

# Frontend
cd frontend
npm run build
# Deploy dist/ folder to your hosting service
```

## API Integration

If you need to add more filtering options (e.g., by status, funding level), you can:

1. **Update Backend Route** (`backend/src/routes/projectRoutes.js`):
```javascript
router.get("/category/:category", getProjectsByCategory);
```

2. **Add Controller** (`backend/src/controllers/projectController.js`):
```javascript
export const getProjectsByCategory = async (req, res) => {
  const { category } = req.params;
  // Filter logic here
};
```

3. **Update Frontend** to use new endpoint:
```typescript
const res = await fetch(`${backend}/api/projects/category/${category}`);
```

## Next Steps

- [ ] Add sorting options (newest, most funded, ending soon)
- [ ] Add filters (funding goal range, days left)
- [ ] Add "Recently Viewed" tracking
- [ ] Add "Similar Projects" recommendations
- [ ] Implement infinite scroll option

## Support

For issues or questions:
1. Check browser console for errors
2. Check backend logs for API errors
3. Verify database connection in Supabase dashboard
4. Test API directly: `curl http://localhost:5000/api/projects`
