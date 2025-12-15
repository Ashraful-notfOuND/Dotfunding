import { supabase } from "../config/supabaseClient.js";

/**
 * Middleware to verify if the user is an admin
 * Usage: Add this middleware to admin-only routes
 */
export const requireAdmin = async (req, res, next) => {
  try {
    // Check for user_id in body, params, or query (handle undefined req.body)
    const userId = (req.body && req.body.user_id) || req.params.user_id || req.query.user_id;

    if (!userId) {
      return res.status(401).json({ 
        error: "Unauthorized",
        message: "User ID is required" 
      });
    }

    // Check if user exists and is admin
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, is_admin")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return res.status(401).json({ 
        error: "Unauthorized",
        message: "User not found" 
      });
    }

    if (!user.is_admin) {
      return res.status(403).json({ 
        error: "Forbidden",
        message: "Admin access required" 
      });
    }

    // Attach admin info to request
    req.admin = user;
    next();
  } catch (err) {
    console.error("Admin middleware error:", err);
    res.status(500).json({ 
      error: "Internal server error",
      message: err.message 
    });
  }
};

/**
 * Middleware to check if user is admin (non-blocking)
 * Attaches isAdmin flag to request without blocking
 */
export const checkAdmin = async (req, res, next) => {
  try {
    // Check for user_id in body, params, or query (handle undefined req.body)
    const userId = (req.body && req.body.user_id) || req.params.user_id || req.query.user_id;

    if (!userId) {
      req.isAdmin = false;
      return next();
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("is_admin")
      .eq("id", userId)
      .single();

    req.isAdmin = user?.is_admin || false;
    next();
  } catch (err) {
    console.error("Check admin error:", err);
    req.isAdmin = false;
    next();
  }
};

/**
 * Verify admin by email (for login scenarios)
 */
export const verifyAdminByEmail = async (email) => {
  try {
    const { data: user, error } = await supabase
      .from("users")
      .select("id, email, is_admin, full_name")
      .eq("email", email)
      .single();

    if (error || !user) {
      return { isAdmin: false, user: null };
    }

    return { 
      isAdmin: user.is_admin || false, 
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        is_admin: user.is_admin
      }
    };
  } catch (err) {
    console.error("Verify admin error:", err);
    return { isAdmin: false, user: null };
  }
};
