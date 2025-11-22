import { supabase } from "../config/supabaseClient.js";

/**
 * Create a notification when someone pledges
 */

export const createNotification = async (req, res) => {
  try {
    const { projectId, senderId, receiverId, amount, message, donorMessage } = req.body;

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
          backer_message: donorMessage || null,
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

    // Fetch notifications - simplified without joins first
    const { data: notifications, error: fetchError } = await supabase
      .from("notifications")
      .select("*")
      .eq("receiver_id", userId)
      .order("created_at", { ascending: false });

    if (fetchError) {
      console.error("Supabase fetch error:", fetchError);
      return res.status(500).json({ error: "Failed to fetch notifications", details: fetchError });
    }

    // Transform the data to include metadata
    const transformedNotifications = notifications.map(notif => ({
      id: notif.id,
      message: notif.message,
      amount: notif.amount,
      is_read: notif.is_read,
      created_at: notif.created_at,
      type: notif.type || 'donation',
      metadata: {
        projectId: notif.project_id,
        projectTitle: null, // Will need to fetch separately if needed
        donorId: notif.sender_id,
        donorName: null, // Will need to fetch separately if needed
        donorEmail: null,
        donorProfilePic: null,
        donationDate: notif.created_at,
        donorMessage: notif.backer_message,
      }
    }));

    return res.status(200).json({ notifications: transformedNotifications });
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

/**
 * Mark a single notification as read
 */
export const markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    if (!notificationId) return res.status(400).json({ error: "Notification ID is required" });

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    if (error) {
      console.error("Supabase update error:", error);
      return res.status(500).json({ error: "Failed to mark notification as read" });
    }

    return res.status(200).json({ message: "Notification marked as read" });
  } catch (err) {
    console.error("markNotificationRead error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
