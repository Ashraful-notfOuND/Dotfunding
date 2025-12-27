import { supabase } from "../config/supabaseClient.js";
import { v4 as uuidv4 } from "uuid";
import { observerManager } from "../services/ProjectObserver.js";
import { projectStateMachine, ProjectStatus } from "../services/ProjectStateMachine.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });


// Multer saves file in req.file
export const createProject = async (req, res) => {
  try {
    const { user_id, title, tagline, funding_goal, funding_deadline, video_url, location, category } = req.body;
    console.log("Request body:", req.body.user_id);
    if (!user_id) return res.status(400).json({ error: "User ID is required" });
    if (!req.file) {
      return res.status(400).json({ error: "Image file is required" });
    }

    const imageFile = req.file;
    const fileExt = imageFile.originalname.split('.').pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = fileName; // you can add subfolders if you want

    // Upload file buffer to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("project-pictures")
      .upload(filePath, imageFile.buffer, {
        cacheControl: "3600",
        upsert: false,
        contentType: imageFile.mimetype,
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("project-pictures")
      .getPublicUrl(filePath);

    const imageUrl = urlData.publicUrl;

    // Insert project into database with pending status
    const { data, error } = await supabase
      .from("main_projects")
      .insert([
        {
          user_id,
          title,
          tagline,
          image_url: imageUrl,
          funding_goal,
          funding_deadline,
          video_url,
          location,
          category,
          approval_status: "pending", // New projects start as pending
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Don't notify interested users yet - wait for admin approval
    // The notification will be sent when admin approves the project
    
    res.status(201).json({
      ...data,
      message: "Project submitted successfully and is pending admin review"
    });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};


export const createCampaign = async (req, res) => {
  try {
    const { project_id, description } = req.body;

    if (!project_id) {
      return res.status(400).json({ error: "Project ID is required" });
    }
    if (!description) {
      return res.status(400).json({ error: "Description is required" });
    }
    // Prefer storing campaign images as an array in `image_urls` (text[])
    const files = req.files || [];
    const imageUrls = [];

    if (files.length > 0) {
      for (const file of files) {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("project-pictures")
          .upload(fileName, file.buffer, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.mimetype,
          });

        if (uploadError) {
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from("project-pictures")
          .getPublicUrl(fileName);

        if (urlData && urlData.publicUrl) imageUrls.push(urlData.publicUrl);
      }
    }

    const row = imageUrls.length > 0 ? { project_id, description, image_urls: imageUrls } : { project_id, description };

    const { data, error } = await supabase.from("project_campaigns").insert([row]).select();
    if (error) throw error;

    res.status(201).json({ campaigns: data });
  } catch (err) {
    console.error("createCampaign error:", err);
    res.status(400).json({ error: err.message });
  }
};




/**
 * Create rewards for a project (expects JSON body: { project_id, rewards: [...] })
 */
// export const createRewards = async (req, res) => {
//   try {
//     const { project_id, rewards } = req.body;

//     if (!project_id) return res.status(400).json({ error: "project_id is required" });
//     if (!rewards || !Array.isArray(rewards) || rewards.length === 0) {
//       return res.status(400).json({ error: "At least one reward is required" });
//     }

//     const rows = rewards.map((r) => ({
//       project_id,
//       title: r.title || "",
//       description: r.description || "",
//       amount: Number(r.amount) || 0,
//       backers: Number(r.backers) || 0,
//       available: Number(r.available) || 0,
//       delivery: r.delivery || null,
//     }));

//     const { data, error } = await supabase.from("reward_table").insert(rows).select();
//     if (error) throw error;

//     return res.status(201).json({ rewards: data });
//   } catch (err) {
//     console.error("createRewards error:", err);
//     return res.status(500).json({ error: err.message || "Failed to create rewards" });
//   }
// };
export const createRewards = async (req, res) => {
  try {
    console.log("Creating rewards for projectId:", req.body.project_id);
    const { project_id, rewards } = req.body;

    if (!project_id) return res.status(400).json({ error: "project_id is required" });
    if (!rewards || !Array.isArray(rewards) || rewards.length === 0) {
      return res.status(400).json({ error: "At least one reward is required" });
    }

    // Map rewards and generate UUID for each
    const rows = rewards.map(r => ({
      id: uuidv4(),
      project_id,
      title: r.title || "",
      description: r.description || "",
      amount: Number(r.amount) || 0,
      backers: Number(r.backers) || 0,
      available: Number(r.available) || 0,
      delivery: r.delivery || null
    }));

    const { data, error } = await supabase
      .from("rewards")
      .insert(rows)
      .select();

    if (error) throw error;

    return res.status(201).json({ rewards: data });
  } catch (err) {
    console.error("createRewards error:", err);
    return res.status(500).json({ error: err.message || "Failed to create rewards" });
  }
};
/**
 * Get rewards for a project
 */
export const getRewards = async (req, res) => {
  try {
    console.log("Fetching rewards for projectId:", req.params.projectId);
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: "projectId is required" });

    const { data, error } = await supabase
      .from("rewards")
      .select("id, title, description, amount, backers, available, delivery")
      .eq("project_id", projectId);

    if (error) throw error;

    return res.status(200).json({ rewards: data });
  } catch (err) {
    console.error("getRewards error:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch rewards" });
  }
};
/**
 * Get rewards for a project
 */
// export const getRewards = async (req, res) => {
//   try {
//     const { projectId } = req.params;
//     if (!projectId) return res.status(400).json({ error: "projectId is required" });

//     const { data, error } = await supabase
//       .from("reward_table")
//       .select("id, title, description, amount, backers, available, delivery")
//       .eq("project_id", projectId);

//     if (error) throw error;

//     return res.status(200).json({ rewards: data });
//   } catch (err) {
//     console.error("getRewards error:", err);
//     return res.status(500).json({ error: err.message || "Failed to fetch rewards" });
//   }
// };



// ============================================
// UPDATED CONTROLLER FUNCTIONS FOR MULTIPLE REWARDS
// Replace these three functions in projectController.js
// ============================================

/**
 * Get user's selected rewards for a project (supports multiple)
 * GET /api/projects/:projectId/rewards/selected?userId=xxx
 */
export const getSelectedReward = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Fetch ALL reward selections for this user and project
    const { data, error } = await supabase
      .from("reward_selections")
      .select("id, reward_id, created_at")
      .eq("user_id", userId)
      .eq("project_id", projectId);

    if (error) {
      throw error;
    }

    // Return array of reward IDs instead of single ID
    const selectedRewardIds = data ? data.map(selection => selection.reward_id) : [];

    return res.status(200).json({ 
      selected: selectedRewardIds  // Returns array like ["id1", "id2"]
    });

  } catch (err) {
    console.error("Error getting selected rewards:", err);
    return res.status(500).json({ error: "Failed to get selected rewards" });
  }
};

/**
 * Deselect a specific reward (delete from reward_selections table)
 * DELETE /api/projects/:projectId/rewards/:rewardId/deselect
 */
export const deselectReward = async (req, res) => {
  try {
    const { projectId, rewardId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    if (!rewardId) {
      return res.status(400).json({ error: "Reward ID is required" });
    }

    console.log(`User ${userId} deselecting reward ${rewardId} for project ${projectId}`);

    // Delete the specific reward selection (not all rewards for this project)
    const { error } = await supabase
      .from("reward_selections")
      .delete()
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .eq("reward_id", rewardId);  // ✅ Added this condition

    if (error) throw error;

    return res.status(200).json({ 
      message: "Reward deselected successfully" 
    });

  } catch (err) {
    console.error("Error deselecting reward:", err);
    return res.status(500).json({ error: "Failed to deselect reward" });
  }
};

/**
 * Save reward selection after successful payment (supports multiple rewards)
 * POST /api/projects/:projectId/rewards/:rewardId/save
 */
export const saveRewardSelection = async (req, res) => {
  try {
    const { projectId, rewardId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    console.log(`Saving reward ${rewardId} for user ${userId}, project ${projectId}`);

    // Check if user already has THIS EXACT reward selected
    const { data: existing, error: checkError } = await supabase
      .from("reward_selections")
      .select("id, reward_id")
      .eq("user_id", userId)
      .eq("project_id", projectId)
      .eq("reward_id", rewardId)  // ✅ Check for this specific reward
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      throw checkError;
    }

    // If user already selected this exact reward, return success
    if (existing) {
      return res.status(200).json({ 
        message: "Reward already saved",
        selection: existing 
      });
    }

    // Otherwise, create new selection (allows multiple rewards per project)
    const { data, error } = await supabase
      .from("reward_selections")
      .insert([{
        user_id: userId,
        project_id: projectId,
        reward_id: rewardId
      }])
      .select()
      .single();

    if (error) throw error;

    return res.status(201).json({ 
      message: "Reward saved successfully",
      selection: data 
    });

  } catch (err) {
    console.error("Error saving reward:", err);
    return res.status(500).json({ error: "Failed to save reward" });
  }
};





export const getUserProjects = async (req, res) => {
  try {
    console.log("Fetching projects for userId:", req.params.userId);
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // fetch the projects for that userId
    // Show all projects for the user (including pending ones in their dashboard)
    const { data: projects, error } = await supabase
      .from("main_projects")
      .select(`
        id,
        title,
        tagline,
        image_url,
        funding_goal,
        funding_deadline,
        category,
        approval_status,
        admin_message
      `)
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user’s projects:", error);
      return res.status(500).json({ error: error.message });
    }

    // Calculate backed amount for each project by summing paid pledges
    const result = await Promise.all(projects.map(async (prj) => {
      const { data: pledges } = await supabase
        .from("pledges")
        .select("amount")
        .eq("project_id", prj.id)
        .eq("status", "paid");

      const backedAmount = pledges 
        ? pledges.reduce((sum, pledge) => sum + Number(pledge.amount || 0), 0)
        : 0;

      return {
        id: prj.id,
        title: prj.title,
        tagline: prj.tagline,
        imageUrl: prj.image_url,
        fundingGoal: prj.funding_goal,
        fundingDeadline: prj.funding_deadline,
        category: prj.category,
        approval_status: prj.approval_status,
        admin_message: prj.admin_message,
        backedAmount: backedAmount,
      };
    }));

    return res.status(200).json({ projects: result });
  } catch (err) {
    console.error("Error in getUserProjects:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


/**
 * Get single project by id
 */
export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Project id is required" });

    // Evaluate and update project status (lazy evaluation)
    const projectStatus = await projectStateMachine.evaluateAndUpdateStatus(id);

    const { data: project, error } = await supabase
      .from("main_projects")
      .select(`id, user_id, title, tagline, image_url, funding_goal, funding_deadline, video_url, location, category, status, approval_status, admin_message`)
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching project:", error);
      return res.status(500).json({ error: error.message || "Failed to fetch project" });
    }

    if (!project) return res.status(404).json({ error: "Project not found" });

    // Map fields to frontend-friendly shape
    // Fetch creator info from `user` table
    let creator = null;
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("id, full_name, email")
        .eq("id", project.user_id)
        .single();
      creator = userData ?? null;
    } catch (e) {
      // ignore creator fetch errors, continue with null creator
      console.error("Warning: failed to fetch creator info", e);
      creator = null;
    }

    // Fetch campaign rows (description + image_urls array)
    let campaignImages = [];
    let campaignDescription = null;
    try {
      const { data: campaigns } = await supabase
        .from("project_campaigns")
        .select("description, image_urls")
        .eq("project_id", id);

      if (campaigns && Array.isArray(campaigns)) {
        // Collect images and pick first non-empty description
        for (const c of campaigns) {
          if (Array.isArray(c.image_urls)) campaignImages.push(...c.image_urls);
          if (!campaignDescription && c.description) campaignDescription = c.description;
        }
      }
    } catch (e) {
      console.error("Warning: failed to fetch campaign rows", e);
    }

    // Fetch rewards for this project
    let rewards = [];
    try {
      const { data: rewardsData } = await supabase
        .from("rewards")
        .select("id, title, description, amount, backers, available, delivery")
        .eq("project_id", id);
      if (Array.isArray(rewardsData)) {
        rewards = rewardsData.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          amount: Number(r.amount) || 0,
          backers: Number(r.backers) || 0,
          available: Number(r.available) || 0,
          delivery: r.delivery || null,
        }));
      }
    } catch (e) {
      console.error("Warning: failed to fetch rewards", e);
    }

  // Build images array: main image first, then campaign images
  const images = [];
  if (project.image_url) images.push(project.image_url);
  if (campaignImages.length) images.push(...campaignImages);

    // Compute daysLeft from funding_deadline if present
    let daysLeft = null;
    if (project.funding_deadline) {
      try {
        const now = new Date();
        const d = new Date(project.funding_deadline);
        const diffMs = d.getTime() - now.getTime();
        daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        if (daysLeft < 0) daysLeft = 0;
      } catch (e) {
        daysLeft = null;
      }
    }

    const result = {
      id: project.id,
      user_id: project.user_id,
      title: project.title,
      tagline: project.tagline,
      imageUrl: project.image_url,
      images,
      fundingGoal: project.funding_goal,
      fundingDeadline: project.funding_deadline,
      videoUrl: project.video_url,
      location: project.location,
      category: project.category,
      creator: creator ? (creator.full_name || null) : null,
      creatorEmail: creator ? creator.email : null,
      daysLeft,
      // description is stored in project_campaigns; use the first campaign description if present
      description: campaignDescription,
      // rewards fetched from reward_table
      rewards,
      // Project lifecycle status
      status: project.status || ProjectStatus.LIVE,
    };

    // Compute fundingCurrent (sum of paid pledges) and backers (distinct users)
    try {
      const { data: pledgeRows } = await supabase.from("pledges").select("amount, user_id").eq("project_id", id).eq("status", "paid");
      if (Array.isArray(pledgeRows)) {
        const fundingCurrent = pledgeRows.reduce((acc, r) => acc + Number(r.amount || 0), 0);
        const uniqueBackers = new Set(pledgeRows.map((r) => r.user_id).filter(Boolean));
        result.fundingCurrent = fundingCurrent;
        // Provide a non-zero display value to avoid showing $0 in the UI while keeping
        // the actual fundingCurrent accurate for calculations.
        result.fundingCurrentDisplay = fundingCurrent > 0 ? fundingCurrent : 1;
        result.backers = uniqueBackers.size;
      } else {
        result.fundingCurrent = 0;
        result.fundingCurrentDisplay = 1; // show at least 1 for UX
        result.backers = 0;
      }
    } catch (e) {
      console.error("Warning: failed to compute fundingCurrent/backers", e);
      result.fundingCurrent = 0;
      result.backers = 0;
    }

    return res.status(200).json({ project: result });
  } catch (err) {
    console.error("getProjectById error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const getCampaignByProjectId = async (req, res) => {
  try {
    console.log("Fetching campaign for projectId:", req.params.projectId);
    const { projectId } = req.params;

    const { data, error } = await supabase
      .from("project_campaigns")
      .select("*")
      .eq("project_id", projectId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "Campaign not found" });
    }

    res.json(data);
  } catch (err) {
    console.error("Error fetching campaign:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


// project creater info

export const getProjectCreator = async (req, res) => {
  const { projectId } = req.params;

  try {
    // Step 1: Fetch the project to get its user_id
    const { data: project, error: projectError } = await supabase
      .from("main_projects")
      .select("user_id")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: "Project not found." });
    }

    // Step 2: Use user_id to fetch creator info from users table
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id, full_name, bio, location, profile_pic")
      .eq("id", project.user_id)
      .single();

    if (userError || !user) {
      return res.status(404).json({ error: "Creator not found." });
    }

    // Step 3: Return the user data
    res.status(200).json({ user });
  } catch (err) {
    console.error("Error fetching creator:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * Get all projects (for homepage)
 */
export const getAllProjects = async (req, res) => {
  try {
    const { data: projects, error } = await supabase
      .from("main_projects")
      .select("id, user_id, title, tagline, image_url, funding_goal, funding_deadline, category, created_at")
      .eq("approval_status", "approved") // Only show approved projects
      .order("created_at", { ascending: false });

    if (error) throw error;

    // For each project compute fundingCurrent (sum of pledges) and fetch creator name
    const formatted = await Promise.all(
      projects.map(async (p) => {
        // sum pledges for this project and count backers
        let fundingCurrent = 0;
        let backers = 0;
        try {
          const { data: pledges } = await supabase.from("pledges").select("amount, user_id").eq("project_id", p.id);
          if (Array.isArray(pledges)) {
            fundingCurrent = pledges.reduce((acc, r) => acc + Number(r.amount || 0), 0);
            // Count unique backers
            backers = new Set(pledges.map(p => p.user_id)).size;
          }
        } catch (e) {
          // ignore
        }

        // fetch creator name
        let creator = "Unknown";
        try {
          const { data: userData } = await supabase.from("users").select("full_name").eq("id", p.user_id).single();
          if (userData && userData.full_name) creator = userData.full_name;
        } catch (e) {}

        // compute daysLeft
        let daysLeft = 0;
        if (p.funding_deadline) {
          try {
            const now = new Date();
            const d = new Date(p.funding_deadline);
            const diffMs = d.getTime() - now.getTime();
            daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
          } catch (e) {
            daysLeft = 0;
          }
        }

        return {
          id: p.id,
          title: p.title,
          creator,
          image: p.image_url,
          fundingGoal: Number(p.funding_goal) || 0,
          fundingCurrent,
          backers,
          daysLeft,
          fundingDeadline: p.funding_deadline, // Include deadline for filtering past projects
          category: p.category || "General",
          tagline: p.tagline || "",
        };
      })
    );

    return res.status(200).json({ projects: formatted });
  } catch (err) {
    console.error("getAllProjects error:", err);
    return res.status(500).json({ error: "Failed to fetch projects" });
  }
};


/**
 * GET project for editing
 * Fetch project, campaign, and rewards only (no FAQs)
 */
export const getProjectForEdit = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Project id is required" });

    // Fetch main project info
    const { data: project, error: projectError } = await supabase
      .from("main_projects")
      .select("*")
      .eq("id", id)
      .single();

    if (projectError || !project)
      return res.status(404).json({ error: "Project not found" });

    // Fetch campaign description/images
    const { data: campaignData } = await supabase
      .from("project_campaigns")
      .select("description, image_urls")
      .eq("project_id", id);

    const campaignDescription = campaignData?.[0]?.description || "";
    const campaignImages = campaignData?.[0]?.image_urls || [];

    // Fetch rewards properly
    const { data: rewardsData } = await supabase
      .from("rewards")
      .select("*")
      .eq("project_id", id)
      .order("amount", { ascending: true }); // optional: order by amount

    res.status(200).json({
      project,
      campaignDescription,
      campaignImages,
      rewards: rewardsData || [],
    });
  } catch (err) {
    console.error("getProjectForEdit error:", err);
    res.status(500).json({ error: "Failed to fetch project data" });
  }
};

/**
 * POST edit project
 * Accepts multipart/form-data for images
 */

export const editProject = [
  // Multer middleware for handling files
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),

  async (req, res) => {
    console.log("===== editProject request received =====");
    console.log("Request params:", req.params);
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    try {
      const { id } = req.params;
      if (!id) return res.status(400).json({ error: "Project id is required" });

      const {
        title,
        tagline,
        category,
        location,
        funding_deadline,
        campaignDescription,
        rewards,
        existingImages: existingImagesJSON,
      } = req.body;

      const existingImagesFrontend = existingImagesJSON ? JSON.parse(existingImagesJSON) : [];

      console.log("Parsed fields:", { title, tagline, category, location, funding_deadline, campaignDescription, rewards, existingImagesFrontend });

      const updates = {};
      if (title) updates.title = title;
      if (tagline) updates.tagline = tagline;
      if (category) updates.category = category;
      if (location) updates.location = location;
      if (funding_deadline) updates.funding_deadline = funding_deadline;

      // Handle main image upload
      if (req.files?.image?.[0]) {
        const file = req.files.image[0];
        const ext = file.originalname.split(".").pop();
        const fileName = `${uuidv4()}.${ext}`;

        console.log("Uploading main image:", file.originalname);

        const { error: uploadError } = await supabase.storage
          .from("project-pictures")
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            cacheControl: "3600",
          });

        if (uploadError) {
          console.error("Main image upload error:", uploadError);
          throw uploadError;
        }

        const { data: urlData } = supabase.storage
          .from("project-pictures")
          .getPublicUrl(fileName);

        console.log("Main image uploaded, URL:", urlData.publicUrl);
        updates.image_url = urlData.publicUrl;
      }

      // Update main project row
      console.log("Updating main project in Supabase with:", updates);

      const { data: updatedProject, error: updateError } = await supabase
        .from("main_projects")
        .update(updates)
        .eq("id", id)
        .select();

      if (updateError) {
        console.error("Supabase update error:", updateError);
        throw updateError;
      }

      if (!updatedProject || updatedProject.length === 0) {
        console.warn("No project found with id:", id);
        return res.status(404).json({ error: "Project not found" });
      }

      console.log("Main project updated:", updatedProject[0]);

      // Handle campaign description & gallery
      if (campaignDescription || req.files?.gallery?.length) {
        let newImageUrls = [];

        // Upload new gallery files
        if (req.files?.gallery?.length) {
          for (const file of req.files.gallery) {
            const ext = file.originalname.split(".").pop();
            const fileName = `${uuidv4()}.${ext}`;
            console.log("Uploading gallery image:", file.originalname);

            const { error: uploadError } = await supabase.storage
              .from("project-pictures")
              .upload(fileName, file.buffer, {
                contentType: file.mimetype,
                cacheControl: "3600",
              });

            if (uploadError) {
              console.error("Gallery image upload error:", uploadError);
              throw uploadError;
            }

            const { data: urlData } = supabase.storage
              .from("project-pictures")
              .getPublicUrl(fileName);

            newImageUrls.push(urlData.publicUrl);
          }
        }

        // Fetch existing images from project_campaigns
        const { data: existingCampaignData, error: fetchError } = await supabase
          .from("project_campaigns")
          .select("image_urls")
          .eq("project_id", id)
          .single();

        if (fetchError && fetchError.code !== "PGRST116") { // ignore "row not found"
          console.error("Failed to fetch existing campaign:", fetchError);
          throw fetchError;
        }

        const existingImagesBackend = existingCampaignData?.image_urls || [];

        // Delete images that were removed on frontend
        const imagesToDelete = existingImagesBackend.filter(img => !existingImagesFrontend.includes(img));
        for (const imgUrl of imagesToDelete) {
          const parts = imgUrl.split("/");
          const fileName = parts[parts.length - 1];
          console.log("Deleting removed image from storage:", fileName);
          await supabase.storage.from("project-pictures").remove([fileName]);
        }

        // Merge remaining existing + new images
        const mergedImages = [...existingImagesFrontend, ...newImageUrls];
        console.log("Final gallery images to save:", mergedImages);

        const { error: campaignError } = await supabase
          .from("project_campaigns")
          .upsert(
            [
              {
                project_id: id,
                description: campaignDescription,
                image_urls: mergedImages.length ? mergedImages : undefined,
              },
            ],
            { onConflict: ["project_id"] }
          );

        if (campaignError) {
          console.error("Campaign upsert error:", campaignError);
          throw campaignError;
        }
      }

      // Handle rewards update
      if (rewards) {
        const rewardsArray = typeof rewards === "string" ? JSON.parse(rewards) : rewards;
        console.log("Parsed rewards:", rewardsArray);

        if (Array.isArray(rewardsArray)) {
          console.log("Deleting old rewards for project:", id);
          await supabase.from("rewards").delete().eq("project_id", id);

          const rewardRows = rewardsArray.map((r) => ({
            id: uuidv4(),
            project_id: id,
            title: r.title || "",
            description: r.description || "",
            amount: Number(r.amount) || 0,
            backers: Number(r.backers) || 0,
            available: Number(r.available) || 0,
            delivery: r.delivery || null,
          }));

          console.log("Inserting new rewards:", rewardRows);
          await supabase.from("rewards").insert(rewardRows);
        }
      }

      res.status(200).json({ message: "Project updated successfully", project: updatedProject[0] });
    } catch (err) {
      console.error("editProject error:", err);
      res.status(500).json({ error: "Failed to update project" });
    }
  },
];




// /**
//  * Create a new project
//  */
// export const createProject = async (req, res) => {
//   try {
//     const {
//       user_id,
//       title,
//       description,
//       category,
//       location,
//       funding_goal,
//       deadline,
//       video_url,
//     } = req.body;

//     // Parse reward_tiers JSON string
//     let reward_tiers = [];
//     if (req.body.reward_tiers) {
//       try {
//         reward_tiers = JSON.parse(req.body.reward_tiers);
//       } catch (err) {
//         return res.status(400).json({ error: "Invalid reward_tiers format." });
//       }
//     }

//     // Validate required fields
//     if (
//       !user_id ||
//       !title ||
//       !description ||
//       !category ||
//       !location ||
//       !funding_goal ||
//       !deadline
//     ) {
//       return res.status(400).json({ error: "All required fields must be provided." });
//     }

//     // ✅ Handle multiple image uploads
//     const imageFiles = req.files;
//     if (!imageFiles || imageFiles.length === 0) {
//       return res.status(400).json({ error: "At least one image file is required." });
//     }

//     const uploadedImageUrls = [];

//     for (const imageFile of imageFiles) {
//       const fileExt = imageFile.originalname.split(".").pop();
//       const fileName = `${uuidv4()}.${fileExt}`;
//       const filePath = `projects/${fileName}`;

//       const { error: uploadError } = await supabase.storage
//         .from("project-images")
//         .upload(filePath, imageFile.buffer, {
//           contentType: imageFile.mimetype,
//           cacheControl: "3600",
//           upsert: false,
//         });

//       if (uploadError) {
//         console.error("Supabase image upload error:", uploadError);
//         return res.status(500).json({ error: "Failed to upload one or more images." });
//       }

//       const {
//         data: { publicUrl },
//       } = supabase.storage.from("project-images").getPublicUrl(filePath);

//       uploadedImageUrls.push(publicUrl);
//     }

//     // ✅ Insert into projects table
//     const { data, error } = await supabase
//       .from("projects")
//       .insert([
//         {
//           user_id,
//           title,
//           description,
//           category,
//           location,
//           funding_goal: Number(funding_goal),
//           deadline,
//           video_url: video_url || null,
//           reward_tiers,
//           image_urls: uploadedImageUrls,
//           status: "launched",
//         },
//       ])
//       .select();

//     if (error) {
//       console.error("Supabase insert error:", error);
//       return res.status(400).json({ error: error.message });
//     }

//     return res.status(201).json({
//       message: "Project created successfully!",
//       project: data[0],
//     });
//   } catch (err) {
//     console.error("Unexpected server error:", err);
//     return res.status(500).json({ error: "Server error." });
//   }
// };

// /**
//  * ✅ Get all projects (with parsed fields)
//  */
// export const getAllProjects = async (req, res) => {
//   try {
//     const { data, error } = await supabase
//       .from("projects")
//       .select("*")
//       .order("created_at", { ascending: false });

//     if (error) throw error;

//     // ✅ Parse stored JSON fields if needed
//     const formattedProjects = data.map((project) => ({
//       ...project,
//       reward_tiers:
//         typeof project.reward_tiers === "string"
//           ? JSON.parse(project.reward_tiers)
//           : project.reward_tiers || [],
//       image_urls:
//         typeof project.image_urls === "string"
//           ? JSON.parse(project.image_urls)
//           : project.image_urls || [],
//     }));

//     return res.status(200).json({ projects: formattedProjects });
//   } catch (err) {
//     console.error("Failed to fetch projects:", err);
//     return res.status(500).json({ error: "Failed to fetch projects." });
//   }
// };



/**
 * Get recent and top donations for a project
 * Returns recent 5 donations and top 5 donations with user info
 */
export const getProjectDonations = async (req, res) => {
  try {
    const { id } = req.params;
    const projectId = id;
    
    if (!projectId) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    console.log(`Fetching donations for project ID: ${projectId}`);

    // Fetch recent 5 paid pledges with user information
    const { data: recentDonations, error: recentError } = await supabase
      .from("pledges")
      .select(`
        id,
        amount,
        created_at,
        user_id,
        users:user_id (
          full_name,
          email
        )
      `)
      .eq("project_id", projectId)
      .eq("status", "paid")
      .order("created_at", { ascending: false })
      .limit(5);

    if (recentError) {
      console.error("Error fetching recent donations:", recentError);
      throw recentError;
    }

    // Fetch top 5 donations (highest amounts) with user information
    const { data: topDonations, error: topError } = await supabase
      .from("pledges")
      .select(`
        id,
        amount,
        created_at,
        user_id,
        users:user_id (
          full_name,
          email
        )
      `)
      .eq("project_id", projectId)
      .eq("status", "paid")
      .order("amount", { ascending: false })
      .limit(5);

    if (topError) {
      console.error("Error fetching top donations:", topError);
      throw topError;
    }

    console.log(`Found ${recentDonations?.length || 0} recent and ${topDonations?.length || 0} top donations`);

    // Format the response
    const formatDonation = (pledge) => ({
      id: pledge.id,
      amount: Number(pledge.amount) || 0,
      donorName: pledge.users?.full_name || "Anonymous",
      donorEmail: pledge.users?.email || null,
      date: pledge.created_at,
    });

    return res.status(200).json({
      recent: (recentDonations || []).map(formatDonation),
      top: (topDonations || []).map(formatDonation),
    });
  } catch (err) {
    console.error("Error fetching project donations:", err);
    return res.status(500).json({ error: "Failed to fetch donations" });
  }
};

/**
 * Get project status and check if it can accept pledges
 * GET /api/projects/:id/status
 */
export const getProjectStatus = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "Project id is required" });

    // Evaluate and get current status
    const status = await projectStateMachine.getProjectStatus(id);
    
    if (!status) {
      return res.status(404).json({ error: "Project not found" });
    }

    const canAcceptPledges = status === ProjectStatus.LIVE;

    return res.status(200).json({
      projectId: id,
      status,
      canAcceptPledges,
      statusInfo: {
        isLive: status === ProjectStatus.LIVE,
        isSuccess: status === ProjectStatus.ENDED_SUCCESS,
        isFailed: status === ProjectStatus.ENDED_FAILED,
      }
    });
  } catch (err) {
    console.error("Error getting project status:", err);
    return res.status(500).json({ error: "Failed to get project status" });
  }
};

/**
 * Batch update project statuses (admin/cron endpoint)
 * POST /api/projects/batch-update-status
 */
export const batchUpdateProjectStatuses = async (req, res) => {
  try {
    console.log("Starting batch project status update...");
    const result = await projectStateMachine.batchUpdateProjectStatuses();
    
    if (!result) {
      return res.status(500).json({ error: "Batch update failed" });
    }

    return res.status(200).json({
      message: "Batch update completed successfully",
      ...result
    });
  } catch (err) {
    console.error("Error in batch update:", err);
    return res.status(500).json({ error: "Batch update failed" });
  }
};

/**
 * Get all backers for a project (for project creator)
 * GET /api/projects/:id/backers
 * Returns list of all backers with their pledge details, reward tier, and messages
 */
export const getProjectBackers = async (req, res) => {
  try {
    const { id } = req.params;
    const { creator_id } = req.query; // Pass creator_id to verify ownership

    if (!id) {
      return res.status(400).json({ error: "Project ID is required" });
    }

    console.log(`Fetching backers for project ID: ${id}`);

    // Verify the requesting user is the project creator
    if (creator_id) {
      const { data: project } = await supabase
        .from("main_projects")
        .select("user_id")
        .eq("id", id)
        .single();

      if (!project || project.user_id !== creator_id) {
        return res.status(403).json({ error: "Unauthorized: Only project creator can view backers" });
      }
    }

    // Fetch all paid pledges with user information, reward details, and backer messages
    const { data: pledges, error: pledgesError } = await supabase
      .from("pledges")
      .select(`
        id,
        amount,
        created_at,
        user_id,
        reward_id,
        tran_id,
        status,
        users:user_id (
          id,
          full_name,
          email
        )
      `)
      .eq("project_id", id)
      .eq("status", "paid")
      .order("created_at", { ascending: false });

    if (pledgesError) {
      console.error("Error fetching pledges:", pledgesError);
      throw pledgesError;
    }

    if (!pledges || pledges.length === 0) {
      return res.status(200).json({
        backers: [],
        totalBackers: 0,
        totalAmount: 0
      });
    }

    // Get all reward IDs from pledges
    const rewardIds = pledges
      .map(p => p.reward_id)
      .filter(id => id != null);

    // Fetch reward details if there are any
    let rewards = [];
    if (rewardIds.length > 0) {
      const { data: rewardData } = await supabase
        .from("reward_table")
        .select("id, title, amount")
        .in("id", rewardIds);
      rewards = rewardData || [];
    }

    // Create a map of reward_id to reward details
    const rewardMap = rewards.reduce((acc, reward) => {
      acc[reward.id] = reward;
      return acc;
    }, {});

    // Get backer messages from payment_sessions
    const tranIds = pledges.map(p => p.tran_id).filter(Boolean);
    let sessions = [];
    if (tranIds.length > 0) {
      const { data: sessionData } = await supabase
        .from("payment_sessions")
        .select("tran_id, backer_message")
        .in("tran_id", tranIds);
      sessions = sessionData || [];
    }

    // Create a map of tran_id to backer_message
    const messageMap = sessions.reduce((acc, session) => {
      acc[session.tran_id] = session.backer_message;
      return acc;
    }, {});

    // Format the backers list
    const backers = pledges.map(pledge => ({
      id: pledge.id,
      amount: Number(pledge.amount) || 0,
      date: pledge.created_at,
      backer: {
        id: pledge.users?.id,
        name: pledge.users?.full_name || "Anonymous",
        email: pledge.users?.email || null
      },
      reward: pledge.reward_id ? {
        id: pledge.reward_id,
        title: rewardMap[pledge.reward_id]?.title || "Unknown Reward",
        amount: rewardMap[pledge.reward_id]?.amount || 0
      } : null,
      pledgeType: pledge.reward_id ? "reward" : "no-reward",
      message: messageMap[pledge.tran_id] || null,
      transactionId: pledge.tran_id
    }));

    // Calculate totals
    const totalAmount = backers.reduce((sum, b) => sum + b.amount, 0);
    const uniqueBackers = new Set(backers.map(b => b.backer.id)).size;

    return res.status(200).json({
      backers,
      totalBackers: uniqueBackers,
      totalPledges: backers.length,
      totalAmount: totalAmount
    });

  } catch (err) {
    console.error("Error fetching project backers:", err);
    return res.status(500).json({ error: "Failed to fetch project backers" });
  }
};

// Get project analytics (views, visitors, conversion rate, etc.)
export const getProjectAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify project exists and user is the owner
    const { data: project, error: projectError } = await supabase
      .from("main_projects")
      .select("id, owner_id, title, created_at")
      .eq("id", id)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // Note: For now, we'll allow any authenticated user to view analytics
    // In production, uncomment this to restrict to project owner only
    // const userId = req.user?.id; // Assuming auth middleware sets req.user
    // if (project.owner_id !== userId) {
    //   return res.status(403).json({ error: "Unauthorized: Only project owner can view analytics" });
    // }

    // Get total views
    const { data: viewsData, error: viewsError } = await supabase
      .from("project_views")
      .select("id, user_id, ip_address, referrer, viewed_at")
      .eq("project_id", id);

    const views = viewsData || [];
    const totalViews = views.length;

    // Calculate unique visitors (based on authenticated users + unique IPs for anonymous)
    const uniqueUserIds = new Set(views.filter(v => v.user_id).map(v => v.user_id));
    const uniqueIPs = new Set(views.filter(v => !v.user_id && v.ip_address).map(v => v.ip_address));
    const uniqueVisitors = uniqueUserIds.size + uniqueIPs.size;

    // Get backers count for conversion rate
    const { data: pledgesData } = await supabase
      .from("pledges")
      .select("user_id")
      .eq("project_id", id);

    const backers = pledgesData || [];
    const uniqueBackers = new Set(backers.map(p => p.user_id)).size;
    const conversionRate = uniqueVisitors > 0 ? ((uniqueBackers / uniqueVisitors) * 100).toFixed(1) : 0;

    // Calculate weekly growth (compare last 7 days vs previous 7 days)
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentViews = views.filter(v => new Date(v.viewed_at) >= last7Days).length;
    const previousViews = views.filter(v => {
      const viewDate = new Date(v.viewed_at);
      return viewDate >= previous7Days && viewDate < last7Days;
    }).length;

    const weeklyGrowth = previousViews > 0 
      ? (((recentViews - previousViews) / previousViews) * 100).toFixed(1)
      : recentViews > 0 ? 100 : 0;

    // Get funding trend (last 7 days)
    const { data: fundingData } = await supabase
      .from("pledges")
      .select("amount, created_at")
      .eq("project_id", id)
      .gte("created_at", last7Days.toISOString())
      .order("created_at", { ascending: true });

    // Group by date
    const fundingByDate = {};
    let cumulativeAmount = 0;

    // Get total funding before last 7 days
    const { data: previousFunding } = await supabase
      .from("pledges")
      .select("amount")
      .eq("project_id", id)
      .lt("created_at", last7Days.toISOString());

    cumulativeAmount = (previousFunding || []).reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    // Build funding trend
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      fundingByDate[dateKey] = cumulativeAmount;
    }

    (fundingData || []).forEach(pledge => {
      const pledgeDate = new Date(pledge.created_at);
      const dateKey = pledgeDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      cumulativeAmount += Number(pledge.amount) || 0;
      if (fundingByDate.hasOwnProperty(dateKey)) {
        fundingByDate[dateKey] = cumulativeAmount;
      }
    });

    const fundingTrend = Object.entries(fundingByDate).map(([date, amount]) => ({
      date,
      amount: Math.round(amount)
    }));

    // Traffic sources from referrer data
    const trafficSources = {};
    views.forEach(view => {
      if (!view.referrer || view.referrer === '') {
        trafficSources['Direct'] = (trafficSources['Direct'] || 0) + 1;
      } else if (view.referrer.includes('facebook') || view.referrer.includes('twitter') || 
                 view.referrer.includes('instagram') || view.referrer.includes('linkedin')) {
        trafficSources['Social Media'] = (trafficSources['Social Media'] || 0) + 1;
      } else if (view.referrer.includes('google') || view.referrer.includes('bing')) {
        trafficSources['Search'] = (trafficSources['Search'] || 0) + 1;
      } else {
        trafficSources['Referral'] = (trafficSources['Referral'] || 0) + 1;
      }
    });

    const totalSources = Object.values(trafficSources).reduce((sum, count) => sum + count, 0);
    const trafficSourcesArray = Object.entries(trafficSources).map(([source, count]) => ({
      source,
      percentage: totalSources > 0 ? Math.round((count / totalSources) * 100) : 0
    }));

    // Count inactive backers (no pledges in last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const { data: recentBackers } = await supabase
      .from("pledges")
      .select("user_id")
      .eq("project_id", id)
      .gte("created_at", thirtyDaysAgo.toISOString());

    const recentBackerIds = new Set((recentBackers || []).map(p => p.user_id));
    const allBackerIds = new Set(backers.map(p => p.user_id));
    const inactiveBackers = allBackerIds.size - recentBackerIds.size;

    return res.status(200).json({
      totalViews,
      uniqueVisitors,
      conversionRate: Number(conversionRate),
      activeBackers: recentBackerIds.size,
      inactiveBackers,
      weeklyGrowth: Number(weeklyGrowth),
      fundingTrend,
      trafficSources: trafficSourcesArray
    });

  } catch (err) {
    console.error("Error fetching project analytics:", err);
    return res.status(500).json({ error: "Failed to fetch project analytics" });
  }
};

// Track project view
export const trackProjectView = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, ipAddress, userAgent, referrer } = req.body;

    // Insert view record
    const { error } = await supabase
      .from("project_views")
      .insert([{
        project_id: id,
        user_id: userId || null,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
        referrer: referrer || null
      }]);

    if (error) throw error;

    return res.status(201).json({ message: "View tracked successfully" });

  } catch (err) {
    console.error("Error tracking project view:", err);
    return res.status(500).json({ error: "Failed to track view" });
  }
};
