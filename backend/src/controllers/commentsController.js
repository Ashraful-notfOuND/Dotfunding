import { supabase } from "../config/supabaseClient.js";
/**
 * Get all comments with their replies
 */
export const getComments = async (req, res) => {
  const { projectId } = req.query; // Get projectId from query params
  try {
    // 1. Top-level comments
  const { data: topComments, error: topError } = await supabase
        .from("comments")
        .select("*, users: user_id (id, full_name, profile_pic)")
        .eq("project_id", projectId) // <--- FILTER BY PROJECT
        .is("parent_id", null)
        .order("created_at", { ascending: false });

    if (topError) throw topError;

    // 2. Get replies
    const topIds = topComments.map(c => c.id);
    let replies = [];

    if (topIds.length > 0) {
      const { data: replyData, error: replyError } = await supabase
        .from("comments")
        .select("*, users: user_id (id, full_name, profile_pic)")
        .in("parent_id", topIds)
        .order("created_at", { ascending: true });

      if (replyError) throw replyError;
      replies = replyData;
    }

    // 3. Combine replies under their parent comment
    const comments = topComments.map(c => ({
      ...c,
      likes: c.likes || 0, // use stored likes
      replies: replies
        .filter(r => r.parent_id === c.id)
        .map(r => ({
          ...r,
          likes: r.likes || 0
        }))
    }));

    res.status(200).json({ comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch comments" });
  }
};

/**
 * Add a comment or reply
 */
export const addComment = async (req, res) => {
const { user_id, text, parent_id, project_id } = req.body;
if (!user_id || !text) return res.status(400).json({ error: "Missing fields" });

  try {
    const { data, error } = await supabase
      .from("comments")
      .insert([{ 
          user_id, 
          text, 
          parent_id: parent_id || null, 
          project_id, // <--- SAVE THE PROJECT ID
          likes: 0 
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ comment: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add comment" });
  }
};

/**
 * Like a comment or reply
 */
export const likeComment = async (req, res) => {
  const { comment_id, user_id } = req.body;
  if (!comment_id || !user_id)
    return res.status(400).json({ error: "Missing comment_id or user_id" });

  try {
    // 1. Check if user already liked the comment
    const { data: existingLike, error: checkError } = await supabase
      .from("comment_likes")
      .select("*")
      .eq("comment_id", comment_id)
      .eq("user_id", user_id)
      .single();

    if (checkError && checkError.code !== "PGRST116") throw checkError;

    if (existingLike) {
      return res.status(400).json({ error: "You can't like a comment more than once" });
    }

    // 2. Insert a new like
    const { error: insertError } = await supabase
      .from("comment_likes")
      .insert([{ comment_id, user_id }]);

    if (insertError) throw insertError;

    // 3. Count total likes
    const { data: likesData, error: likesError } = await supabase
      .from("comment_likes")
      .select("id", { count: "exact" })
      .eq("comment_id", comment_id);

    if (likesError) throw likesError;

    const totalLikes = likesData.length;

    // 4. Update the `likes` column in `comments` table
    const { error: updateError } = await supabase
      .from("comments")
      .update({ likes: totalLikes })
      .eq("id", comment_id);

    if (updateError) throw updateError;

    // 5. Return updated likes count
    res.status(200).json({ likes: totalLikes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to like comment" });
  }
};

