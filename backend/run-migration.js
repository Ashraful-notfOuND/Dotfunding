import { supabase } from "./src/config/supabaseClient.js";
import fs from 'fs';

async function runMigration() {
  try {
    console.log("🔧 Running admin system migration...\n");

    // Add is_admin column to users (will be ignored if exists)
    console.log("1. Adding is_admin column to users...");
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE'
    });
    if (error1) console.log("   Note:", error1.message);

    // Add columns to main_projects
    console.log("2. Adding approval columns to main_projects...");
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE main_projects 
        ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP,
        ADD COLUMN IF NOT EXISTS reviewed_by UUID,
        ADD COLUMN IF NOT EXISTS admin_message TEXT;
      `
    });
    if (error2) console.log("   Note:", error2.message);

    console.log("\n✅ Migration completed!");
    console.log("\nNext steps:");
    console.log("1. Create an admin account (signup normally)");
    console.log("2. Run: node make-admin.js your-email@example.com");
    console.log("3. Login and access /admin");
    
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
    console.log("\n⚠️  Please run the SQL manually in Supabase Dashboard:");
    console.log("   Go to: SQL Editor");
    console.log("   Copy content from: database/admin_system_schema.sql");
    console.log("   Click: Run");
  }
}

runMigration();
