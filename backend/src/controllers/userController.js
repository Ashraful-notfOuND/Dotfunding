import bcrypt from "bcrypt";
import { supabase } from "../config/supabaseClient.js";
import { v4 as uuidv4 } from "uuid";
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
      user: { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone, bio: user.bio, location: user.location, profile_pic: user.profile_pic },
    });

  } catch (err) {
    console.error("Unexpected server error:", err);
    return res.status(500).json({ error: "Server error." });
  }
};

/**
 * Handle OAuth login (Google/Facebook)
 * Creates user if doesn't exist, or returns existing user
 */
export const oauthLogin = async (req, res) => {
  const { email, full_name, profile_pic, provider } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required for OAuth login." });
  }

  try {
    // Check if user already exists
    const { data: existingUser, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    // If user exists, return their data
    if (existingUser) {
      return res.status(200).json({
        message: "Login successful!",
        user: {
          id: existingUser.id,
          full_name: existingUser.full_name,
          email: existingUser.email,
          phone: existingUser.phone,
          bio: existingUser.bio,
          location: existingUser.location,
          profile_pic: existingUser.profile_pic,
        },
      });
    }

    // User doesn't exist, create new user
    // For OAuth users, we don't need a password
    const { data, error } = await supabase
      .from("users")
      .insert([{
        full_name: full_name || "User",
        email,
        profile_pic: profile_pic || null,
        password: null, // OAuth users don't have passwords
      }])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      message: "User created successfully!",
      user: {
        id: data[0].id,
        full_name: data[0].full_name,
        email: data[0].email,
        phone: data[0].phone,
        bio: data[0].bio,
        location: data[0].location,
        profile_pic: data[0].profile_pic,
      },
    });

  } catch (err) {
    console.error("OAuth login error:", err);
    return res.status(500).json({ error: "Server error during OAuth login." });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { id, full_name, email, password, phone, bio, location } = req.body;
    console.log("updateProfile req.body:", req.body);
    console.log("updateProfile req.file:", req.file);
    
    if (!id) return res.status(400).json({ error: "User ID is required" });

    let profilePicUrl = null;

    // Handle profile picture upload
    if (req.file) {
      const file = req.file;
      const fileExt = file.originalname.split(".").pop();
      const fileName = `${uuidv4()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(fileName, file.buffer, {
          cacheControl: "3600",
          upsert: true,
          contentType: file.mimetype,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }

      const { data: urlData } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(fileName);

      profilePicUrl = urlData.publicUrl;
    }

    // Prepare update data
    let updateData = {
      full_name,
      email,
      phone,
      bio,
      location,
    };

    // Add profile pic if uploaded
    if (profilePicUrl) {
      updateData.profile_pic = profilePicUrl;
    }

    // Hash password if provided
    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateData.password = hashedPassword;
    }

    // Update user in Supabase table
    const { data, error } = await supabase
      .from("users") 
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      throw error;
    }

    return res.status(200).json({ 
      message: "Profile updated successfully", 
      user: data 
    });
  } catch (err) {
    console.error("updateProfile error:", err);
    return res.status(500).json({ 
      error: err.message || "Failed to update profile" 
    });
  }
};

/**
 * Get user by id
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "User id is required" });

    const { data: user, error } = await supabase
      .from("users")
      .select("id, full_name, email, phone, bio, location, profile_pic")
      .eq("id", id)
      .single();

    if (error) {
      // If no rows
      if (error.code === "PGRST116") return res.status(404).json({ error: "User not found" });
      console.error("Supabase getUserById error:", error);
      return res.status(500).json({ error: "Failed to fetch user" });
    }

    if (!user) return res.status(404).json({ error: "User not found" });

    return res.status(200).json({ user });
  } catch (err) {
    console.error("getUserById error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
