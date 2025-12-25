#!/bin/bash

# Setup Transaction Logging System
# This script sets up the transaction_logs table in the database

echo "🔧 Setting up Transaction Logging System..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ psql command not found. Please install PostgreSQL client."
    exit 1
fi

# Read database connection details from .env or prompt user
if [ -f "../backend/.env" ]; then
    source "../backend/.env"
    echo "✅ Loaded environment variables from .env"
fi

# Prompt for database URL if not set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not found in environment."
    echo "Please set these variables in your .env file or provide database connection details."
    exit 1
fi

echo "📊 Creating transaction_logs table..."

# Extract database connection details from Supabase URL
# Note: This script assumes you have direct database access
# For Supabase, you can also use the Supabase Dashboard SQL Editor

echo ""
echo "⚠️  Please run the following SQL in your Supabase Dashboard SQL Editor:"
echo "   File: database/create_transaction_logs.sql"
echo ""
echo "Or use the Supabase CLI:"
echo "   supabase db reset"
echo ""

# Alternative: If you have direct database access
# Uncomment the following lines and provide your database connection string
# DB_CONNECTION_STRING="postgresql://user:password@host:port/database"
# psql $DB_CONNECTION_STRING -f create_transaction_logs.sql

echo "✅ Setup instructions provided!"
echo ""
echo "📝 Next steps:"
echo "   1. Run the SQL file 'create_transaction_logs.sql' in your database"
echo "   2. Restart your backend server: npm start"
echo "   3. Test the transaction logging by making a payment"
echo ""
echo "📁 Receipt PDFs will be stored in: backend/receipts/"
echo ""
echo "🔗 Available endpoints:"
echo "   - GET /api/transactions/user/:userId - Get user's transactions"
echo "   - GET /api/transactions/project/:projectId - Get project's transactions"
echo "   - GET /api/transactions/:tranId - Get specific transaction"
echo "   - GET /api/transactions/stats/summary - Get transaction statistics"
echo "   - GET /api/receipts/:filename - Download receipt PDF"
echo ""
