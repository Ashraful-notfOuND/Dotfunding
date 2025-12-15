#!/bin/bash

# Admin System Setup Script
# This script sets up the admin moderation system in the Supabase database

echo "Setting up Admin System..."

# Check if SUPABASE_URL and SUPABASE_KEY are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_KEY" ]; then
    echo "Error: SUPABASE_URL and SUPABASE_KEY environment variables must be set"
    echo "Please set them in your .env file and source it"
    exit 1
fi

# Run the SQL schema file
# You can run this directly in Supabase SQL Editor or use psql
echo "Please run the admin_system_schema.sql file in your Supabase SQL Editor"
echo ""
echo "Steps:"
echo "1. Go to your Supabase dashboard"
echo "2. Navigate to SQL Editor"
echo "3. Copy and paste the content of database/admin_system_schema.sql"
echo "4. Run the SQL commands"
echo ""
echo "After running the schema, you need to set admin users:"
echo "UPDATE users SET is_admin = TRUE WHERE email = 'your-admin-email@example.com';"
echo ""
echo "Setup script completed!"
