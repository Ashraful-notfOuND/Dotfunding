# Transaction Logging Setup

## Quick Start

Run this SQL file in your Supabase Dashboard to set up transaction logging:

### Steps:

1. **Open Supabase Dashboard**
   - Go to your project at https://supabase.com/dashboard
   - Navigate to SQL Editor

2. **Run the Migration**
   - Click "New Query"
   - Copy the entire contents of `create_transaction_logs.sql`
   - Paste and click "Run"

3. **Verify**
   - Go to Table Editor
   - You should see a new table: `transaction_logs`

4. **Restart Backend**
   ```bash
   cd ../backend
   npm start
   ```

## What This Does

Creates a `transaction_logs` table that automatically logs:
- ✅ All payment transactions (success, failed, pending)
- ✅ Customer and payment details
- ✅ Gateway responses
- ✅ PDF receipt URLs

## Files in This Directory

- `create_transaction_logs.sql` - Main migration file (RUN THIS!)
- `setup_transaction_logs.sh` - Helper script with instructions

## Next Steps

After running the migration:
1. Make a test payment
2. Check the `transaction_logs` table
3. Look for PDF receipts in `backend/receipts/`
4. Test API endpoints (see docs)

## Documentation

Full guides available in `../docs/`:
- `TRANSACTION_LOGGING_GUIDE.md` - Complete documentation
- `TRANSACTION_LOGGING_QUICK_REF.md` - Quick reference
- `TRANSACTION_LOGGING_IMPLEMENTATION.md` - Implementation details

## Support

If you encounter any issues, check the troubleshooting section in the full guide.
