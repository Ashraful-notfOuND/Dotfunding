import { supabase } from "../config/supabaseClient.js";

/**
 * Get all updates for a project
 */
export const getUpdates = async (req, res) => {
  const { projectId } = req.params;
  try {
    const { data: updates, error } = await supabase
      .from("updates")
      .select("*, users: user_id (id, full_name, profile_pic)")
      .eq("project_id", projectId)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json({ updates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch updates" });
  }
};

/**
 * Add a new update
 */
export const addUpdate = async (req, res) => {
  const { project_id, user_id, title, body } = req.body;
  if (!project_id || !user_id || !title || !body) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const { data, error } = await supabase
      .from("updates")
      .insert([{ project_id, user_id, title, body, upvotes: 0 }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ update: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add update" });
  }
};

/**
 * Upvote an update
 */
export const upvoteUpdate = async (req, res) => {
  const { update_id, user_id } = req.body;
  if (!update_id || !user_id) return res.status(400).json({ error: "Missing fields" });

  try {
    // Check if user already liked
    const { data: existing, error: checkError } = await supabase
      .from("update_likes")
      .select("*")
      .eq("update_id", update_id)
      .eq("user_id", user_id)
      .single();

    if (checkError && checkError.code !== "PGRST116") throw checkError;

    if (existing) {
      return res.status(400).json({ error: "You can't upvote twice" });
    }

    // Insert new like
    const { error: insertError } = await supabase
      .from("update_likes")
      .insert([{ update_id, user_id }]);

    if (insertError) throw insertError;

    // Count total likes
    const { data: likesData, error: likesError } = await supabase
      .from("update_likes")
      .select("id", { count: "exact" })
      .eq("update_id", update_id);

    if (likesError) throw likesError;

    const totalLikes = likesData.length;

    // Update `upvotes` column
    const { error: updateError } = await supabase
      .from("updates")
      .update({ upvotes: totalLikes })
      .eq("id", update_id);

    if (updateError) throw updateError;

    res.status(200).json({ upvotes: totalLikes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message || "Failed to upvote update" });
  }
};

/**
 * Delete an update
 */
export const deleteUpdate = async (req, res) => {
  const { updateId } = req.params;
  try {
    console.log("Deleting update with ID:", updateId);
    const { error } = await supabase
      .from("updates")
      .delete()
      .eq("id", updateId);

    if (error) throw error;

    res.status(200).json({ message: "Update deleted" });
  } catch (err) {
    console.error("Delete update error:", err);
    res.status(500).json({ error: "Failed to delete update" });
  }
};

