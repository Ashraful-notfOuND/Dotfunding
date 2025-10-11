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
