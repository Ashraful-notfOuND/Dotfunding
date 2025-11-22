# Payment Sessions Table Setup

## Problem
SSLCommerz payment gateway **strips custom query parameters** from redirect URLs. When you send:
```
http://localhost:5000/api/payments/success?project_id=xxx&user_id=yyy
```

SSLCommerz redirects to:
```
http://localhost:5000/api/payments/success?val_id=zzz&tran_id=www
```

The `project_id` and `user_id` are lost!

## Solution
Store transaction metadata in a `payment_sessions` table during payment initialization, then retrieve it using `tran_id` after payment completes.

## Setup Steps

### Option 1: Supabase Dashboard (Recommended)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `backend/database/create_payment_sessions.sql`
4. Paste and **Run** the SQL

### Option 2: Command Line
```bash
# Set your database URL
export DATABASE_URL="postgresql://user:pass@host:port/dbname"

# Run the migration
psql $DATABASE_URL < backend/database/create_payment_sessions.sql
```

### Option 3: From Supabase Admin
```bash
cd backend/database
chmod +x setup_payment_sessions.sh
./setup_payment_sessions.sh
```

## Verify Table Creation

Run this query in Supabase SQL Editor to verify:
```sql
SELECT * FROM payment_sessions LIMIT 1;
```

If successful, you should see column names but no rows yet.

## Test the Fix

1. Create the table using one of the methods above
2. Try making a payment again
3. Check backend logs - you should see:
   - "initPayment: payment_session created successfully"
   - "successHandler: payment_session lookup result"
4. Payment should now complete successfully!

## Table Schema

```sql
payment_sessions
├── id (UUID, Primary Key)
├── tran_id (TEXT, Unique) ← Used to lookup transaction
├── project_id (UUID)
├── user_id (UUID) 
├── reward_id (UUID)
├── amount (DECIMAL)
├── return_url (TEXT)
├── donor_message (TEXT)
└── created_at (TIMESTAMP)
```
