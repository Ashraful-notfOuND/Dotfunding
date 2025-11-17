import { supabase } from "../config/supabaseClient.js";

/**
 * Create a notification when someone pledges
 */

export const createNotification = async (req, res) => {
  try {
    const { projectId, senderId, receiverId, amount, message } = req.body;

    // Validate input
    if (!projectId || !senderId || !receiverId || !amount) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Insert notification
    const { data, error } = await supabase
      .from("notifications")
      .insert([
        {
          project_id: projectId,
          sender_id: senderId,
          receiver_id: receiverId,
          amount: amount,
          message: message || `You received a new pledge of $${amount}!`,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to create notification" });
    }

    return res.status(201).json({
      message: "Notification created successfully",
      notification: data[0],
    });
  } catch (err) {
    console.error("createNotification error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get notifications for a user
 */

export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    // Fetch notifications
    const { data: notifications, error: fetchError } = await supabase
      .from("notifications")
      .select("*")
      .eq("receiver_id", userId)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Supabase fetch error:", fetchError);
      return res.status(500).json({ error: "Failed to fetch notifications" });
    }

    // Update all fetched notifications to mark them as read
    const idsToUpdate = notifications.map((n) => n.id);

    if (idsToUpdate.length > 0) {
      const { error: updateError } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .in("id", idsToUpdate);

      if (updateError) {
        console.error("Supabase update error:", updateError);
        // We don't fail the request if marking as read fails
      }
    }

    return res.status(200).json({ notifications });
  } catch (err) {
    console.error("getNotifications error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// PUT /api/notifications/mark-read/:userId
export const markNotificationsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("receiver_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("Supabase update error:", error);
      return res.status(500).json({ error: "Failed to mark notifications as read" });
    }

    return res.status(200).json({ message: "Notifications marked as read" });
  } catch (err) {
    console.error("markNotificationsRead error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
