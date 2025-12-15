import { supabase } from "./src/config/supabaseClient.js";

async function makeAdmin() {
  const email = process.argv[2];
  
  if (!email) {
    console.error("Usage: node make-admin.js <email>");
    process.exit(1);
  }

  try {
    // First check if user exists
    const { data: user, error: fetchError } = await supabase
      .from("users")
      .select("id, email, full_name, is_admin")
      .eq("email", email)
      .single();

    if (fetchError) {
      console.error("❌ User not found:", email);
      console.error("Error:", fetchError.message);
      process.exit(1);
    }

    console.log("Found user:", user);

    // Make them admin
    const { data, error } = await supabase
      .from("users")
      .update({ is_admin: true })
      .eq("email", email)
      .select();

    if (error) {
      console.error("❌ Failed to update user:", error.message);
      process.exit(1);
    }

    console.log("✅ Successfully made", email, "an admin!");
    console.log("User can now login and access /admin dashboard");
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

makeAdmin();
