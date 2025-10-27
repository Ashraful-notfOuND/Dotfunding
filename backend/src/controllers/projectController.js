import { supabase } from "../config/supabaseClient.js";
import { v4 as uuidv4 } from "uuid";


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

    // Insert project into database
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
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
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
// faqs
export const createFAQs = async (req, res) => {
  try {
    const { project_id, faqs } = req.body;

    if (!project_id || !Array.isArray(faqs)) {
      return res.status(400).json({ error: "Invalid request format" });
    }

    // Remove any existing FAQ row for this project (optional safeguard)
    await supabase.from("project_faqs").delete().eq("project_id", project_id);

    // Insert new row with FAQs as JSON
    const { data, error } = await supabase
      .from("project_faqs")
      .insert([{ project_id, faqs }])
      .select();

    if (error) throw error;

    res.status(201).json({ message: "FAQs saved successfully", data });
  } catch (err) {
    console.error("Error saving FAQs:", err);
    res.status(500).json({ error: "Failed to save FAQs" });
  }
};



/**
 * Create rewards for a project (expects JSON body: { project_id, rewards: [...] })
 */
export const createRewards = async (req, res) => {
  try {
    const { project_id, rewards } = req.body;

    if (!project_id) return res.status(400).json({ error: "project_id is required" });
    if (!rewards || !Array.isArray(rewards) || rewards.length === 0) {
      return res.status(400).json({ error: "At least one reward is required" });
    }

    const rows = rewards.map((r) => ({
      project_id,
      title: r.title || "",
      description: r.description || "",
      amount: Number(r.amount) || 0,
      backers: Number(r.backers) || 0,
      available: Number(r.available) || 0,
      delivery: r.delivery || null,
    }));

    const { data, error } = await supabase.from("reward_table").insert(rows).select();
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
    const { projectId } = req.params;
    if (!projectId) return res.status(400).json({ error: "projectId is required" });

    const { data, error } = await supabase
      .from("reward_table")
      .select("id, title, description, amount, backers, available, delivery")
      .eq("project_id", projectId);

    if (error) throw error;

    return res.status(200).json({ rewards: data });
  } catch (err) {
    console.error("getRewards error:", err);
    return res.status(500).json({ error: err.message || "Failed to fetch rewards" });
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
    const { data: projects, error } = await supabase
      .from("main_projects")
      .select(`
        id,
        title,
        tagline,
        image_url,
        funding_goal,
        funding_deadline,
        category
      `)
      .eq("user_id", userId);

    if (error) {
      console.error("Error fetching user’s projects:", error);
      return res.status(500).json({ error: error.message });
    }

    const result = projects.map((prj) => ({
      id: prj.id,
      title: prj.title,
      tagline: prj.tagline,
      imageUrl: prj.image_url,
      fundingGoal: prj.funding_goal,
      fundingDeadline: prj.funding_deadline,
      category: prj.category,
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

    const { data: project, error } = await supabase
      .from("main_projects")
      .select(`id, user_id, title, tagline, image_url, funding_goal, funding_deadline, video_url, location, category`)
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
        .from("user")
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
        .from("reward_table")
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
    };

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

export const getFAQsByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { data, error } = await supabase
      .from("project_faqs")
      .select("faqs")
      .eq("project_id", projectId)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: "FAQs not found" });
    }

    res.status(200).json(data.faqs);
  } catch (err) {
    console.error("Error fetching FAQs:", err);
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
};
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

