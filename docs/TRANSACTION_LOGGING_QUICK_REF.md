# Transaction Logging - Quick Reference

## Setup (One-time)

1. **Run SQL migration in Supabase Dashboard:**
   ```sql
   -- Copy and paste: database/create_transaction_logs.sql
   ```

2. **Restart backend server:**
   ```bash
   cd backend
   npm start
   ```

## What Gets Logged

Every payment transaction is automatically logged with:
- Transaction details (ID, amount in Bangladeshi Taka ৳, status)
- Customer information
- Project and reward details
- Payment gateway response
- **PDF receipt (for successful transactions)**

## API Endpoints

### Get Transactions
```bash
# User's transactions
GET /api/transactions/user/:userId

# Project's transactions
GET /api/transactions/project/:projectId

# Specific transaction
GET /api/transactions/:tranId

# Statistics
GET /api/transactions/stats/summary?projectId=uuid&userId=uuid
```

### Download Receipt
```bash
# Download PDF receipt
GET /api/receipts/:filename
```

## Storage

- **Database**: `transaction_logs` table in Supabase
- **PDF Files**: `backend/receipts/` directory
- **Access URL**: `http://localhost:5000/api/receipts/FILENAME.pdf`

## Transaction Statuses

- `success` - Payment completed successfully (PDF generated)
- `failed` - Payment failed
- `pending` - Payment in progress
- `cancelled` - Payment cancelled by user
- `refunded` - Payment refunded

## Frontend Integration Examples

### Display Transaction History
```typescript
const transactions = await fetch(`/api/transactions/user/${userId}`).then(r => r.json());
```

### Download Receipt
```typescript
window.open(transaction.receipt_pdf_url, '_blank');
```

### Show Statistics
```typescript
const stats = await fetch(`/api/transactions/stats/summary?projectId=${projectId}`).then(r => r.json());
console.log(`Total: ৳${stats.total_amount} Taka from ${stats.successful_transactions} payments`);
```

## Security

- ✅ Row-Level Security enabled
- ✅ Users can only view their own transactions
- ✅ Project creators can view their project's transactions
- ✅ Backend uses service role for full access

## Files Created

1. `database/create_transaction_logs.sql` - Database schema
2. `backend/src/services/TransactionPDFService.js` - PDF generation service
3. `backend/src/routes/transactionRoutes.js` - Transaction API
4. `backend/src/routes/receiptRoutes.js` - Receipt download API
5. `backend/src/controllers/paymentController.js` - Updated with logging
6. `docs/TRANSACTION_LOGGING_GUIDE.md` - Full documentation

## Testing

1. Make a test payment
2. Check database: `SELECT * FROM transaction_logs ORDER BY created_at DESC LIMIT 10;`
3. Check receipts: `ls backend/receipts/`
4. Test API: `curl http://localhost:5000/api/transactions/user/USER_ID`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| PDFs not generating | Check `backend/receipts/` exists and is writable |
| Transactions not logged | Verify `transaction_logs` table exists |
| Receipt 404 | Check file exists in receipts directory |

For detailed documentation, see `docs/TRANSACTION_LOGGING_GUIDE.md`
