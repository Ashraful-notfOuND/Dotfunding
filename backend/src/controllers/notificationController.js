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
      read: notif.is_read, // Add both formats for compatibility
      created_at: notif.created_at,
      type: notif.type || 'donation',
      metadata: {
        // Use stored metadata if available, otherwise build from individual fields
        ...(notif.metadata || {}),
        projectId: notif.metadata?.projectId || notif.project_id,
        projectTitle: notif.metadata?.projectTitle || null,
        donorId: notif.sender_id,
        donorName: notif.metadata?.donorName || null,
        donorEmail: notif.metadata?.donorEmail || null,
        donorProfilePic: notif.metadata?.donorProfilePic || null,
        donationDate: notif.created_at,
        donorMessage: notif.backer_message,
        amount: notif.amount,
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

/**
 * Save notification preferences
 */
export const saveNotificationPreferences = async (req, res) => {
  try {
    console.log('📥 Received saveNotificationPreferences request');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    
    const { 
      userId, 
      email_enabled, 
      push_enabled, 
      pledge_notifications,
      comment_notifications,
      update_notifications,
      recommendation_notifications,
      milestone_notifications,
      campaign_ending_notifications
    } = req.body;
    
    if (!userId) {
      console.log('❌ Missing userId');
      return res.status(400).json({ error: "User ID is required" });
    }

    console.log('💾 Saving preferences for user:', userId);
    console.log('Email enabled:', email_enabled);
    console.log('Push enabled:', push_enabled);
    console.log('Pledge notifications:', pledge_notifications);

    // Upsert preferences
    const { data, error } = await supabase
      .from("notification_preferences")
      .upsert({
        user_id: userId,
        email_enabled: email_enabled ?? true,
        push_enabled: push_enabled ?? true,
        pledge_notifications: pledge_notifications ?? true,
        comment_notifications: comment_notifications ?? true,
        update_notifications: update_notifications ?? true,
        recommendation_notifications: recommendation_notifications ?? true,
        milestone_notifications: milestone_notifications ?? true,
        campaign_ending_notifications: campaign_ending_notifications ?? true,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Error saving preferences:", error);
      return res.status(500).json({ error: "Failed to save preferences", details: error.message });
    }

    console.log('✅ Preferences saved successfully:', data);
    return res.status(200).json({ message: "Preferences saved successfully", preferences: data });
  } catch (err) {
    console.error("saveNotificationPreferences error:", err);
    return res.status(500).json({ error: "Internal server error", details: err.message });
  }
};

/**
 * Get notification preferences for a user
 */
export const getNotificationPreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ error: "User ID is required" });

    const { data, error } = await supabase
      .from("notification_preferences")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching preferences:", error);
      return res.status(500).json({ error: "Failed to fetch preferences" });
    }

    // Return default preferences if none exist
    const preferences = data || {
      email_enabled: true,
      push_enabled: true,
      pledge_notifications: true,
      comment_notifications: true,
      update_notifications: true,
      recommendation_notifications: true,
      milestone_notifications: true,
      campaign_ending_notifications: true,
    };

    return res.status(200).json(preferences);
  } catch (err) {
    console.error("getNotificationPreferences error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
