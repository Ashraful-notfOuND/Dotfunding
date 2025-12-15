import { supabase } from "../config/supabaseClient.js";
import { supabaseAdmin } from "../config/supabaseAdmin.js";
import { sendEmail } from "../services/EmailService.js";

// Use admin client for all operations to bypass RLS
const db = supabaseAdmin;

/**
 * Helper function to create notification without req/res
 */
async function addNotification(user_id, sender_id, type, content, related_id) {
  try {
    const { error } = await db
      .from("notifications")
      .insert([{
        receiver_id: user_id,
        sender_id: sender_id,
        type: type,
        message: content,
        project_id: related_id,
        is_read: false
      }]);
    
    if (error) {
      console.error("Error creating notification:", error);
    }
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
}

/**
 * Get all pending projects for admin review
 */
export const getPendingProjects = async (req, res) => {
  try {
    const { data, error } = await db
      .from("main_projects")
      .select(`
        *,
        users:user_id (
          id,
          full_name,
          email,
          profile_pic
        )
      `)
      .eq("approval_status", "pending")
      .order("created_at", { ascending: true });

    if (error) throw error;

    res.status(200).json({
      success: true,
      count: data.length,
      projects: data
    });
  } catch (err) {
    console.error("Get pending projects error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get all projects with any status (admin view)
 */
export const getAllProjectsAdmin = async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from("main_projects")
      .select(`
        *,
        users:user_id (
          id,
          full_name,
          email,
          profile_pic
        )
      `, { count: 'exact' });

    if (status) {
      query = query.eq("approval_status", status);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    res.status(200).json({
      success: true,
      total: count,
      projects: data,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: count > (parseInt(offset) + parseInt(limit))
      }
    });
  } catch (err) {
    console.error("Get all projects admin error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Approve a project
 */
export const approveProject = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { admin_id, message } = req.body;

    console.log("Approve project:", { project_id, admin_id, message });

    // Get project details before approval
    const { data: project, error: projectError } = await db
      .from("main_projects")
      .select(`
        *,
        creator:user_id (
          id,
          full_name,
          email
        )
      `)
      .eq("id", project_id)
      .single();

    if (projectError) throw projectError;

    console.log("Found project:", project);

    // Update project status
    console.log("Updating project with:", {
      approval_status: "approved",
      reviewed_at: new Date().toISOString(),
      reviewed_by: admin_id,
      admin_message: message || "Your project has been approved!"
    });

    const { data, error } = await db
      .from("main_projects")
      .update({
        approval_status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: admin_id,
        admin_message: message || "Your project has been approved!"
      })
      .eq("id", project_id)
      .select();

    console.log("Update result:", { data, error });

    if (error) throw error;
    if (!data || data.length === 0) {
      throw new Error("Failed to update project - no rows affected");
    }

    const updatedProject = data[0];

    // Insert review record
    await db
      .from("project_reviews")
      .insert({
        project_id,
        admin_id,
        action: "approved",
        message: message || "Project approved"
      });

    // Notify project creator
    await addNotification(
      project.user_id,
      admin_id,
      "project_approved",
      `Your project "${project.title}" has been approved and is now live!`,
      project_id
    );

    // Send email to creator
    try {
      await sendEmail({
        to: project.creator.email,
        subject: "🎉 Your Project Has Been Approved!",
        html: `
          <h2>Congratulations ${project.creator.full_name}!</h2>
          <p>Your project "<strong>${project.title}</strong>" has been approved by our admin team.</p>
          <p>Your project is now live and visible to all users on the explore page.</p>
          ${message ? `<p><strong>Admin Note:</strong> ${message}</p>` : ''}
          <p>Best of luck with your campaign!</p>
        `
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
    }

    // Notify users interested in this category (async, non-blocking)
    notifyInterestedUsers(project).catch(err => 
      console.error("Background notification error:", err)
    );

    res.status(200).json({
      success: true,
      message: "Project approved successfully",
      project: data
    });
  } catch (err) {
    console.error("Approve project error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Reject a project
 */
export const rejectProject = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { admin_id, message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        error: "Rejection message is required" 
      });
    }

    // Get project details and backers
    const { data: project, error: projectError } = await db
      .from("main_projects")
      .select(`
        *,
        creator:user_id (
          id,
          full_name,
          email
        )
      `)
      .eq("id", project_id)
      .single();

    if (projectError) throw projectError;

    // Resume projected
    const { data, error } = await db
      .from("main_projects")
      .update({
        approval_status: "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: admin_id,
        admin_message: message
      })
      .eq("id", project_id)
      .select()
      .single();

    if (error) throw error;

    // Insert review record
    await db
      .from("project_reviews")
      .insert({
        project_id,
        admin_id,
        action: "rejected",
        message
      });

    // Notify project creator
    await addNotification(
      project.user_id,
      admin_id,
      "project_rejected",
      `Your project "${project.title}" was not approved. Reason: ${message}`,
      project_id
    );

    // Send email to creator
    try {
      await sendEmail({
        to: project.creator.email,
        subject: "Project Review Update",
        html: `
          <h2>Hello ${project.creator.full_name},</h2>
          <p>Thank you for submitting your project "<strong>${project.title}</strong>".</p>
          <p>After careful review, we're unable to approve your project at this time.</p>
          <p><strong>Reason:</strong></p>
          <p>${message}</p>
          <p>You're welcome to revise and resubmit your project addressing these concerns.</p>
          <p>If you have any questions, please contact our support team.</p>
        `
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Project rejected",
      project: data
    });
  } catch (err) {
    console.error("Reject project error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Pause a live project
 */
export const pauseProject = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { admin_id, message } = req.body;

    const { data: project, error: projectError } = await db
      .from("main_projects")
      .select(`
        *,
        users:user_id (
          id,
          full_name,
          email
        )
      `)
      .eq("id", project_id)
      .single();

    if (projectError) throw projectError;

    const { data, error } = await db
      .from("main_projects")
      .update({
        approval_status: "paused",
        reviewed_at: new Date().toISOString(),
        reviewed_by: admin_id,
        admin_message: message || "Project paused by admin"
      })
      .eq("id", project_id)
      .select()
      .single();

    if (error) throw error;

    await db
      .from("project_reviews")
      .insert({
        project_id,
        admin_id,
        action: "paused",
        message
      });

    await addNotification(
      project.user_id,
      admin_id,
      "project_paused",
      `Your project "${project.title}" has been paused.`,
      project_id
    );

    try {
      await sendEmail({
        to: project.creator.email,
        subject: "Your Project Has Been Paused",
        html: `
          <h2>Hello ${project.creator.full_name},</h2>
          <p>Your project "<strong>${project.title}</strong>" has been temporarily paused by our admin team.</p>
          ${message ? `<p><strong>Reason:</strong> ${message}</p>` : ''}
          <p>Please contact our support team for more information.</p>
        `
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Project paused successfully",
      project: data
    });
  } catch (err) {
    console.error("Pause project error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Resume a paused project
 */
export const resumeProject = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { admin_id, message } = req.body;

    const { data: project, error: projectError } = await db
      .from("main_projects")
      .select(`
        *,
        users:user_id (
          id,
          full_name,
          email
        )
      `)
      .eq("id", project_id)
      .single();

    if (projectError) throw projectError;

    const { data, error } = await db
      .from("main_projects")
      .update({
        approval_status: "approved",
        reviewed_at: new Date().toISOString(),
        reviewed_by: admin_id,
        admin_message: message || "Project resumed"
      })
      .eq("id", project_id)
      .select()
      .single();

    if (error) throw error;

    await db
      .from("project_reviews")
      .insert({
        project_id,
        admin_id,
        action: "resumed",
        message
      });

    await addNotification(
      project.user_id,
      admin_id,
      "project_resumed",
      `Your project "${project.title}" has been resumed and is live again!`,
      project_id
    );

    res.status(200).json({
      success: true,
      message: "Project resumed successfully",
      project: data
    });
  } catch (err) {
    console.error("Resume project error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Permanently remove a project
 */
export const removeProject = async (req, res) => {
  try {
    const { project_id } = req.params;
    const { admin_id, message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        error: "Removal message is required" 
      });
    }

    const { data: project, error: projectError } = await db
      .from("main_projects")
      .select(`
        *,
        users:user_id (
          id,
          full_name,
          email
        )
      `)
      .eq("id", project_id)
      .single();

    if (projectError) throw projectError;

    const { data, error } = await db
      .from("main_projects")
      .update({
        approval_status: "removed",
        reviewed_at: new Date().toISOString(),
        reviewed_by: admin_id,
        admin_message: message
      })
      .eq("id", project_id)
      .select()
      .single();

    if (error) throw error;

    await db
      .from("project_reviews")
      .insert({
        project_id,
        admin_id,
        action: "removed",
        message
      });

    await addNotification(
      project.user_id,
      admin_id,
      "project_removed",
      `Your project "${project.title}" has been removed.`,
      project_id
    );

    try {
      await sendEmail({
        to: project.creator.email,
        subject: "Important: Your Project Has Been Removed",
        html: `
          <h2>Hello ${project.creator.full_name},</h2>
          <p>Your project "<strong>${project.title}</strong>" has been removed from our platform.</p>
          <p><strong>Reason:</strong> ${message}</p>
          <p>If you believe this was done in error, please contact our support team.</p>
        `
      });
    } catch (emailError) {
      console.error("Email send error:", emailError);
    }

    res.status(200).json({
      success: true,
      message: "Project removed successfully",
      project: data
    });
  } catch (err) {
    console.error("Remove project error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get admin dashboard statistics
 */
export const getAdminStats = async (req, res) => {
  try {
    const { data, error } = await db
      .from("main_projects")
      .select("approval_status");

    if (error) throw error;

    const stats = {
      pending: data.filter(p => p.approval_status === "pending").length,
      approved: data.filter(p => p.approval_status === "approved").length,
      rejected: data.filter(p => p.approval_status === "rejected").length,
      paused: data.filter(p => p.approval_status === "paused").length,
      removed: data.filter(p => p.approval_status === "removed").length,
      total: data.length
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (err) {
    console.error("Get admin stats error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get project review history
 */
export const getProjectReviewHistory = async (req, res) => {
  try {
    const { project_id } = req.params;

    const { data, error } = await db
      .from("project_reviews")
      .select(`
        *,
        admin:admin_id (
          id,
          full_name,
          email
        )
      `)
      .eq("project_id", project_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.status(200).json({
      success: true,
      reviews: data
    });
  } catch (err) {
    console.error("Get review history error:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Helper function to notify interested users about new approved project
 */
async function notifyInterestedUsers(project) {
  try {
    // Get users interested in this category
    const { data: interestedUsers, error } = await db
      .from("user_interests")
      .select("user_id, users:user_id(email, full_name)")
      .eq("category", project.category);

    if (error || !interestedUsers || interestedUsers.length === 0) {
      return;
    }

    // Create notifications for interested users (use correct schema)
    const notifications = interestedUsers.map(user => ({
      receiver_id: user.user_id,
      sender_id: null, // System notification
      type: "new_project_in_category",
      message: `New ${project.category} project: "${project.title}" is now live!`,
      project_id: project.id,
      is_read: false
    }));

    await db.from("notifications").insert(notifications);

    // Send emails asynchronously (non-blocking)
    // Use Promise.allSettled to avoid blocking on individual email failures
    const emailPromises = interestedUsers.map(user => 
      sendEmail({
        to: user.users.email,
        subject: `New ${project.category} Project on DotFunding`,
        html: `
          <h2>Hello ${user.users.full_name}!</h2>
          <p>A new project in the <strong>${project.category}</strong> category has just launched:</p>
          <h3>${project.title}</h3>
          <p>${project.tagline || 'Check it out and be one of the first backers!'}</p>
        `
      }).catch(err => console.error(`Email failed for ${user.users.email}:`, err))
    );

    // Don't await - let emails send in background
    Promise.allSettled(emailPromises);
  } catch (err) {
    console.error("Notify interested users error:", err);
  }
}
