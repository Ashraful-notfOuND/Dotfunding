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
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "At least one image file is required" });
    }

    const imageUrls = [];

    // Upload each image
    for (const file of req.files) {
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

      imageUrls.push(urlData.publicUrl);
    }

    // Insert into project_campaigns (with image_urls as text[] array)
    const { data, error } = await supabase
      .from("project_campaigns")
      .insert([
        {
          project_id,
          description,
          image_urls: imageUrls,
        },
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json(data);
  } catch (err) {
    console.error("createCampaign error:", err);
    res.status(400).json({ error: err.message });
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
