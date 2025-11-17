# SSLCommerz Payment Integration Guide

## ✅ What's Implemented

Your backend now has a complete SSLCommerz payment integration with the following features:

### 1. Payment Initialization (`POST /api/payments/init`)
- Creates payment session with SSLCommerz
- Stores transaction details in `payment_sessions` table
- Returns `GatewayPageURL` to redirect users to payment gateway

### 2. Payment Validation (`POST /api/payments/validate`)
- Validates payment with SSLCommerz using `val_id`
- Creates pledge record in database
- Updates reward tier counts (backers, available)
- **Updates project backed amount** (calculated from pledges)

### 3. Success Handler (`GET/POST /api/payments/success`)
- Handles SSLCommerz redirect after successful payment
- Creates pledge record if not already exists
- Redirects user back to project page with success status
- **Updates project backed amount**

### 4. IPN Handler (`POST /api/payments/ipn`)
- Receives server-to-server notifications from SSLCommerz
- Validates payment independently
- Creates pledge with idempotency check
- **Updates project backed amount**
- Updates reward tier counts

### 5. Helper Functions
- `updateProjectBackedAmount()` - Calculates total backed amount from all paid pledges

## 🔑 Environment Variables

Make sure your `.env` file has:

```env
SSLCZ_STORE_ID=dotfu68ff4cb4a95d7
SSLCZ_STORE_PASS=dotfu68ff4cb4a95d7@ssl
SSLCZ_IS_LIVE=false
```

✅ These are already set in your `.env` file!

## �� Dependencies

✅ `sslcommerz-lts` package is now installed!

## 🧪 Testing the Payment Flow

### Test in Sandbox Mode:

1. **Start your backend server:**
   ```bash
   cd backend
   npm run dev
   ```

2. **Make a payment from frontend:**
   - Go to a project page
   - Click "Back this project"
   - Fill in the pledge form
   - Submit payment

3. **You'll be redirected to SSLCommerz sandbox payment page**
   - Use test card numbers provided by SSLCommerz
   - Complete the test payment

4. **After successful payment:**
   - User is redirected back to project page
   - Pledge is created in database
   - Project backed amount is updated
   - Notification is sent to project owner
   - Reward tier counts are updated (if applicable)

### SSLCommerz Test Card Numbers:

For testing in sandbox, use these card details:
- **Card Number:** 4111111111111111
- **Expiry:** Any future date (e.g., 12/25)
- **CVV:** Any 3 digits (e.g., 123)
- **Name:** Any name

## 🔍 How Project Backed Amount is Updated

The backed amount is **NOT stored** in the projects table. Instead, it's **calculated dynamically** from the `pledges` table when you fetch a project.

When a payment succeeds:
1. A new pledge record is created with `status = "paid"`
2. `updateProjectBackedAmount()` is called
3. The function queries all paid pledges for the project
4. Logs the total backed amount
5. Frontend fetches the project and calculates `fundingCurrent` from pledges

This approach ensures data consistency - there's only one source of truth (the pledges table).

## 📊 Database Tables Used

### `payment_sessions`
- Stores temporary payment session data
- Maps `tran_id` to project/user/reward details
- Used to restore context after payment gateway redirects

### `pledges`
- Stores all pledges
- Fields: `project_id`, `user_id`, `reward_id`, `tran_id`, `amount`, `status`
- Status is set to "paid" after successful payment

### `reward_table`
- Tracks reward tier backers and availability
- Updated after each successful pledge

## 🐛 Debugging

Check backend console logs for:
- `initPayment:` - Payment initialization
- `SSLCommerz init response:` - Gateway response
- `IPN received:` - IPN notifications
- `Project X: Total backed amount = Y` - Backed amount updates

## 🚀 Going Live

To use real transactions (NOT RECOMMENDED until fully tested):

1. Get production credentials from SSLCommerz
2. Update `.env`:
   ```env
   SSLCZ_STORE_ID=your_production_store_id
   SSLCZ_STORE_PASS=your_production_password
   SSLCZ_IS_LIVE=true
   ```

⚠️ **Keep `IS_LIVE=false` for development and testing!**

## 📝 API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/payments/init` | POST | Initialize payment |
| `/api/payments/validate` | POST | Validate payment |
| `/api/payments/success` | GET/POST | Success redirect handler |
| `/api/payments/ipn` | POST | IPN notification handler |

