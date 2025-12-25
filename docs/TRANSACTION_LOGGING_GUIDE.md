# Transaction Logging System

## Overview

The Transaction Logging System provides comprehensive logging of all payment transactions with automatic PDF receipt generation. Every transaction (successful, failed, or pending) is logged with detailed information and a downloadable PDF receipt is generated for successful transactions.

## Features

- ✅ **Comprehensive Transaction Logging**: All payment transactions are logged in the `transaction_logs` table
- 📄 **Automatic PDF Receipt Generation**: PDF receipts are automatically generated for successful transactions
- 🔒 **Secure Access**: Row-level security ensures users can only view their own transactions
- 📊 **Transaction Statistics**: Get insights with transaction summary and statistics
- 🌐 **RESTful API**: Easy-to-use endpoints for retrieving transactions and receipts
- 💾 **Persistent Storage**: Receipts are stored on the server and accessible via URLs

## Database Schema

### `transaction_logs` Table

```sql
- id: UUID (Primary Key)
- tran_id: TEXT (Unique transaction identifier)
- val_id: TEXT (Validation ID from payment gateway)
- project_id: UUID (Foreign Key to main_projects)
- user_id: UUID (Foreign Key to users)
- reward_id: UUID (Foreign Key to reward_table)
- pledge_id: UUID (Foreign Key to pledges)
- amount: DECIMAL(10, 2)
- currency: TEXT (Default: 'BDT' - Bangladeshi Taka ৳)
- gateway_type: TEXT (Default: 'sslcommerz')
- card_type: TEXT (e.g., 'VISA', 'MASTERCARD')
- card_brand: TEXT
- card_issuer: TEXT
- card_issuer_country: TEXT
- status: TEXT ('success', 'failed', 'pending', 'cancelled', 'refunded')
- risk_level: INTEGER
- customer_name: TEXT
- customer_email: TEXT
- customer_phone: TEXT
- gateway_response: JSONB (Full gateway response)
- error_message: TEXT
- receipt_pdf_url: TEXT (URL to download PDF receipt)
- receipt_generated_at: TIMESTAMPTZ
- transaction_date: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## Setup Instructions

### 1. Run Database Migration

Execute the SQL migration to create the transaction_logs table:

```bash
cd database
bash setup_transaction_logs.sh
```

Or manually run the SQL in Supabase Dashboard:

1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `database/create_transaction_logs.sql`
3. Execute the SQL

### 2. Install Dependencies

The required dependency (`pdfkit`) is already installed. If needed:

```bash
cd backend
npm install pdfkit
```

### 3. Restart Backend Server

```bash
cd backend
npm start
```

## API Endpoints

### Transaction Endpoints

#### Get User Transactions
```
GET /api/transactions/user/:userId?status=success&limit=50&offset=0
```

**Query Parameters:**
- `status` (optional): Filter by status ('success', 'failed', 'pending')
- `limit` (optional): Number of records (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "transactions": [
    {
      "id": "uuid",
      "tran_id": "tran_123456",
      "amount": 100.00,
      "status": "success",
      "receipt_pdf_url": "http://localhost:5000/api/receipts/receipt_tran_123456.pdf",
      ...
    }
  ],
  "count": 10
}
```

#### Get Project Transactions
```
GET /api/transactions/project/:projectId?status=success&limit=50&offset=0
```

Same query parameters and response format as user transactions.

#### Get Specific Transaction
```
GET /api/transactions/:tranId
```

**Response:**
```json
{
  "transaction": {
    "id": "uuid",
    "tran_id": "tran_123456",
    "amount": 100.00,
    "status": "success",
    "receipt_pdf_url": "http://localhost:5000/api/receipts/receipt_tran_123456.pdf",
    "gateway_response": {...},
    ...
  }
}
```

#### Get Transaction Statistics
```
GET /api/transactions/stats/summary?projectId=uuid&userId=uuid&startDate=2024-01-01&endDate=2024-12-31
```

**Query Parameters:** (all optional)
- `projectId`: Filter by project
- `userId`: Filter by user
- `startDate`: Start date (ISO format)
- `endDate`: End date (ISO format)

**Response:**
```json
{
  "stats": {
    "total_transactions": 100,
    "successful_transactions": 95,
    "failed_transactions": 5,
    "pending_transactions": 0,
    "total_amount": 10000.00,
    "average_amount": 105.26,
    "currency": "BDT" // Bangladeshi Taka
  }
}
```

### Receipt Endpoints

#### Download Receipt PDF
```
GET /api/receipts/:filename
```

Downloads the PDF receipt file. The filename is included in the transaction log record.

**Example:**
```
GET /api/receipts/receipt_tran_1234567890_1234567890.pdf
```

## PDF Receipt Format

The generated PDF receipts include:

- **Header**: Dotfunding branding and title
- **Status Badge**: Visual indicator of transaction status
- **Transaction Information**: 
  - Transaction ID
  - Validation ID
  - Transaction Date (Asia/Dhaka timezone)
  - Payment Gateway
- **Project Information**:
  - Project Title
  - Project ID
  - Reward Tier (if applicable)
- **Customer Information**:
  - Name
  - Email
  - Phone
- **Payment Details**:
  - Amount and Currency (Bangladeshi Taka ৳)
  - Payment Method (card type/brand)
  - Card Issuer
- **Total Amount Box**: Highlighted total
- **Footer**: Timestamp and contact information

## How It Works

### 1. Transaction Logging Flow

When a payment is processed:

1. **Payment Initialization** (`/api/payments/init`):
   - Payment session is created in `payment_sessions` table
   - User is redirected to payment gateway

2. **Payment Success** (`/api/payments/success`):
   - Payment is validated with gateway
   - Pledge is created in `pledges` table
   - **Transaction is logged** in `transaction_logs` table
   - **PDF receipt is generated** automatically
   - Receipt URL is stored in transaction log
   - User is redirected back to project page

3. **Payment Validation** (`/api/payments/validate`):
   - Similar flow for programmatic validation
   - Transaction logged with all details

### 2. PDF Generation

The `TransactionPDFService` handles PDF generation:

```javascript
import TransactionPDFService from '../services/TransactionPDFService.js';

const receiptData = {
  tran_id: 'tran_123456',
  project_title: 'Amazing Project',
  customer_name: 'John Doe',
  amount: 100,
  // ... other details
};

const pdfPath = await TransactionPDFService.generateReceipt(receiptData);
const receiptUrl = TransactionPDFService.getReceiptUrl(pdfPath);
```

## Storage Location

PDF receipts are stored in:
```
backend/receipts/
```

The directory is automatically created if it doesn't exist.

## Security Considerations

### Row-Level Security (RLS)

The `transaction_logs` table has RLS policies:

1. **Users can view their own transactions**:
   ```sql
   user_id = auth.uid()
   ```

2. **Project creators can view their project's transactions**:
   ```sql
   project_id IN (SELECT id FROM main_projects WHERE user_id = auth.uid())
   ```

3. **Service role has full access** (for backend operations)

### Receipt Download Security

- Filenames are validated to prevent directory traversal attacks
- Only existing receipts can be downloaded
- Consider adding authentication middleware to restrict access

## Frontend Integration

### Example: Display User's Transaction History

```typescript
async function fetchUserTransactions(userId: string) {
  const response = await fetch(`/api/transactions/user/${userId}?status=success`);
  const data = await response.json();
  return data.transactions;
}
```

### Example: Download Receipt

```typescript
function downloadReceipt(receiptUrl: string, tranId: string) {
  const link = document.createElement('a');
  link.href = receiptUrl;
  link.download = `receipt_${tranId}.pdf`;
  link.click();
}
```

### Example: Display Transaction Statistics

```typescript
async function fetchProjectStats(projectId: string) {
  const response = await fetch(`/api/transactions/stats/summary?projectId=${projectId}`);
  const data = await response.json();
  return data.stats;
}
```

## Maintenance

### Cleanup Old Receipts

To clean up old receipt files (optional):

```javascript
import TransactionPDFService from './services/TransactionPDFService.js';

// Delete receipts older than 90 days
await TransactionPDFService.cleanupOldReceipts(90);
```

You can set up a cron job to run this periodically.

## Testing

### Test Transaction Logging

1. Make a test payment through your application
2. Check the `transaction_logs` table in Supabase
3. Verify the PDF receipt was generated in `backend/receipts/`
4. Test downloading the receipt via the API

### Test Endpoints

```bash
# Get user transactions
curl http://localhost:5000/api/transactions/user/USER_ID

# Get transaction details
curl http://localhost:5000/api/transactions/TRAN_ID

# Download receipt
curl -O http://localhost:5000/api/receipts/FILENAME.pdf

# Get statistics
curl http://localhost:5000/api/transactions/stats/summary?projectId=PROJECT_ID
```

## Troubleshooting

### Issue: PDFs not generating

**Solution:**
- Check if `backend/receipts/` directory exists and is writable
- Check backend logs for PDF generation errors
- Ensure `pdfkit` is installed: `npm install pdfkit`

### Issue: Transactions not being logged

**Solution:**
- Verify `transaction_logs` table exists in database
- Check if service role key has proper permissions
- Check backend logs for database insert errors

### Issue: Receipt download fails

**Solution:**
- Verify the receipt file exists in `backend/receipts/`
- Check file permissions
- Ensure the filename is correct (no URL encoding issues)

## Future Enhancements

- 📧 Email receipts to customers automatically
- 🔄 Add refund transaction logging
- 📊 Advanced analytics dashboard
- 🌍 Multi-currency support
- 🎨 Customizable receipt templates
- ☁️ Cloud storage integration (S3, Cloudinary)

## Support

For issues or questions, please contact the development team or create an issue in the repository.
