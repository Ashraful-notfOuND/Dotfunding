#!/bin/bash

# Quick script to create payment_sessions table
# Make sure you have your Supabase credentials set up

echo "Creating payment_sessions table..."
echo ""
echo "Please run the following SQL in your Supabase dashboard (SQL Editor):"
echo ""
cat backend/database/create_payment_sessions.sql
echo ""
echo "Or set your DATABASE_URL and run:"
echo "psql \$DATABASE_URL < backend/database/create_payment_sessions.sql"
