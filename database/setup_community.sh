#!/bin/bash

# Community System Setup Script
# This script runs the database migration for the community system

echo "🚀 Setting up Community System..."
echo ""

# Database credentials from your Supabase
DB_URL="postgresql://postgres.slxmqvqfhvyusayvuotf:Dotfunding1234@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres"

# Check if psql is installed
if ! command -v psql &> /dev/null; then
    echo "❌ Error: psql is not installed"
    echo "📦 Install PostgreSQL client:"
    echo "   macOS: brew install postgresql@15"
    echo "   Ubuntu: sudo apt-get install postgresql-client"
    exit 1
fi

echo "📊 Running database migration..."
psql "$DB_URL" -f database/create_community_system.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Community system setup complete!"
    echo ""
    echo "Next steps:"
    echo "1. Restart your backend server"
    echo "2. Refresh your frontend"
    echo "3. Navigate to any project and click the Community tab"
else
    echo ""
    echo "❌ Migration failed. Please check the error above."
    exit 1
fi
