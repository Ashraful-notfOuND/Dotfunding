# Project Reviews Feature Setup Guide

## Overview
This feature allows backers to leave ratings (1-5 stars) and optional review messages for projects they've backed. Similar to Google Play Store reviews.

## Setup Steps

### 1. Run Database Migration

Go to your Supabase dashboard and run the SQL in `backend/database/create_reviews.sql`:

```sql
-- This creates the reviews table with:
-- - Star rating (1-5)
-- - Optional review text
-- - One review per user per project
-- - Automatic timestamps
```

### 2. Restart Backend Server

The backend routes are already configured. Just restart your server:

```bash
cd backend
npm start
```

### 3. Test the Feature

1. **View Reviews Tab**
   - Go to any project page
   - Click on "Reviews" tab (between Comments and Statistics)
   - You'll see the review section

2. **Leave a Review** (Must be a backer)
   - Make a pledge on a project first
   - Go to Reviews tab
   - Click stars to rate (1-5)
   - Optionally add a review message
   - Click "Submit Review"

3. **View Statistics**
   - Average rating displayed prominently
   - Rating distribution bars (5-star, 4-star, etc.)
   - Total review count

4. **Edit Your Review**
   - Click "Edit" button on your review
   - Update rating or message
   - Click "Update Review"

5. **Delete Your Review**
   - Click "Delete" button on your review
   - Confirm deletion

## Features

✅ **Star Rating System**
- Interactive 1-5 star selection
- Hover effect for preview
- Visual gold stars

✅ **Review Text**
- Optional message (can leave just rating)
- Multi-line textarea
- No character limit

✅ **Statistics Dashboard**
- Large average rating display
- Visual rating distribution bars
- Total review count

✅ **User Restrictions**
- Only backers can review
- One review per user per project
- Can edit/delete own review only

✅ **Review Display**
- Shows reviewer name
- Review date
- Star rating
- Review message (if provided)
- User avatar (first letter)

## API Endpoints

### POST /api/reviews
Create or update a review
```json
{
  "projectId": "uuid",
  "userId": "uuid",
  "rating": 5,
  "reviewText": "Great project!"
}
```

### GET /api/reviews/project/:projectId
Get all reviews for a project with statistics

### GET /api/reviews/project/:projectId/user/:userId
Get specific user's review for a project

### DELETE /api/reviews/:reviewId
Delete a review (must be review owner)

## Database Schema

```sql
reviews (
  id UUID PRIMARY KEY
  project_id UUID -> main_projects
  user_id UUID -> users
  rating INTEGER (1-5)
  review_text TEXT (nullable)
  created_at TIMESTAMP
  updated_at TIMESTAMP
  UNIQUE(project_id, user_id)
)
```

## Validation Rules

1. **Rating Required**: Must select 1-5 stars
2. **Review Text Optional**: Can submit without message
3. **Backer Verification**: Must have backed project (checked via pledges table)
4. **One Review Per Project**: Unique constraint enforces this
5. **Owner Only Actions**: Can only edit/delete own reviews

## UI Components

### ProjectReviews.tsx
Main component with 3 sections:
1. **Statistics Card** - Overall rating summary
2. **User Review Form** - Write/edit review
3. **All Reviews List** - Display all reviews

### Features:
- Loading states
- Error handling with toast notifications
- Responsive design
- Interactive star ratings
- Inline editing
- Confirmation for delete

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "You must back this project" | User hasn't pledged | Make a pledge first |
| "Rating required" | No stars selected | Select 1-5 stars |
| "Authentication required" | Not logged in | Log in to review |
| "Failed to submit review" | Server error | Check backend logs |

## Testing Checklist

- [ ] Database migration runs successfully
- [ ] Reviews tab appears between Comments and Statistics
- [ ] Can view review statistics when reviews exist
- [ ] Non-backers cannot submit reviews
- [ ] Backers can submit reviews with rating only
- [ ] Backers can submit reviews with rating + text
- [ ] Can edit own review
- [ ] Can delete own review
- [ ] Cannot edit/delete others' reviews
- [ ] Average rating calculates correctly
- [ ] Rating distribution bars show correct percentages
- [ ] Star hover effect works
- [ ] Toast notifications appear for all actions

## Future Enhancements

- [ ] Helpful/unhelpful voting on reviews
- [ ] Verified backer badge
- [ ] Sort reviews (most recent, highest rated)
- [ ] Filter by star rating
- [ ] Image upload with reviews
- [ ] Review reply from creators
- [ ] Report inappropriate reviews

## Troubleshooting

### "Failed to save review"
**Check:** User has backed the project (query pledges table)

### Reviews not appearing
**Check:** 
1. Database migration ran successfully
2. Backend server restarted
3. Browser console for errors

### Can't click stars
**Check:** User is logged in and isEditing is true

### "Duplicate key" error
**Solution:** User already has a review - use edit instead

## Notes

- Reviews are permanent record (soft delete could be added)
- Only backers can review (enforced in backend)
- Star ratings are whole numbers only (1, 2, 3, 4, 5)
- Review statistics update in real-time after submission
- Reviews display newest first
