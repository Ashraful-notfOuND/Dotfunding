import bcrypt from "bcrypt";
import { supabase } from "../config/supabaseClient.js";

/**
 * Sign up a new user
 */
export const signUpUser = async (req, res) => {
  const { full_name, email, password } = req.body;

  // 1. Validate input
  if (!full_name || !email || !password) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    // 2. Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (fetchError && fetchError.code !== "PGRST116") { 
      // PGRST116 = no rows found, which is fine
      console.error("Error fetching user:", fetchError);
      return res.status(500).json({ error: "Server error while checking user." });
    }

    if (existingUser) {
      return res.status(409).json({ error: "Email already registered." });
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Insert new user
    const { data, error } = await supabase
      .from("users")
      .insert([{ full_name, email, password: hashedPassword }])
      .select(); // select() returns inserted row

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      message: "User created successfully!",
      user: { id: data[0].id, full_name: data[0].full_name, email: data[0].email },
    });

  } catch (err) {
    console.error("Unexpected server error:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

/**
 * Login user
 */
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    // Fetch user by email
    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error) {
      // If user not found
      if (error.code === "PGRST116") {
        return res.status(401).json({ error: "Invalid email or password." });
      }
      console.error("Supabase fetch error:", error);
      return res.status(500).json({ error: "Server error." });
    }

    // Compare password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    // Login successful
    return res.status(200).json({
      message: "Login successful!",
      user: { id: user.id, full_name: user.full_name, email: user.email },
    });

  } catch (err) {
    console.error("Unexpected server error:", err);
    return res.status(500).json({ error: "Server error." });
  }
};

