/**
 * Create a new project
 */
import { supabase } from "../config/supabaseClient.js";
import { v4 as uuidv4 } from "uuid";

export const createProject = async (req, res) => {
  try {
    const {
      user_id,
      title,
      description,
      category,
      location,
      funding_goal,
      deadline,
      video_url,
    } = req.body;

    // Parse reward_tiers
    let reward_tiers = [];
    if (req.body.reward_tiers) {
      try {
        reward_tiers = JSON.parse(req.body.reward_tiers);
      } catch (err) {
        return res.status(400).json({ error: "Invalid reward_tiers format." });
      }
    }

    // Validate required fields
    if (
      !user_id ||
      !title ||
      !description ||
      !category ||
      !location ||
      !funding_goal ||
      !deadline
    ) {
      return res.status(400).json({ error: "All required fields must be provided." });
    }

    // Handle image upload to Supabase
    const imageFile = req.file;
    if (!imageFile) {
      return res.status(400).json({ error: "Image file is required." });
    }

    const fileExt = imageFile.originalname.split(".").pop();
    const fileName = `${uuidv4()}.${fileExt}`;
    const filePath = `projects/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("project-images") // Replace with your Supabase bucket name
      .upload(filePath, imageFile.buffer, {
        contentType: imageFile.mimetype,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Supabase image upload error:", uploadError);
      return res.status(500).json({ error: "Failed to upload image." });
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("project-images").getPublicUrl(filePath);

    // Insert into projects table
    const { data, error } = await supabase
      .from("projects")
      .insert([
        {
          user_id,
          title,
          description,
          category,
          location,
          funding_goal: Number(funding_goal),
          deadline,
          video_url: video_url || null,
          reward_tiers,
          image_url: publicUrl,
          status: "launched",
        },
      ])
      .select();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({
      message: "Project created successfully!",
      project: data[0],
    });
  } catch (err) {
    console.error("Unexpected server error:", err);
    return res.status(500).json({ error: "Server error." });
  }
};

/**
 * Get all projects (optional for listing)
 */
export const getAllProjects = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.status(200).json({ projects: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch projects." });
  }
};
