import { supabase } from "../config/supabaseClient.js";
import { v4 as uuidv4 } from "uuid";
// faqs
// export const createFAQ = async (req, res) => {
//   try {
//     console.log("Create FAQ request body:", req.body);
//     const { project_id, question, answer } = req.body;

//     if (!project_id || !question || !answer) {
//       return res.status(400).json({ error: "Missing fields" });
//     }

//     const { data, error } = await supabase
//       .from("project_faqs")
//       .insert([{ project_id, question, answer }])
//       .select()
//       .single();

//     if (error) throw error;

//     res.status(201).json(data);
//   } catch (err) {
//     console.error("Create FAQ error:", err);
//     res.status(500).json({ error: "Failed to create FAQ" });
//   }
// };

export const createFAQ = async (req, res) => {
  try {
    const { project_id, faqs } = req.body;

    if (!project_id || !Array.isArray(faqs) || faqs.length === 0) {
      return res.status(400).json({ error: "Invalid FAQ data" });
    }

    const payload = faqs.map(faq => ({
      project_id,
      question: faq.question,
      answer: faq.answer,
    }));

    const { data, error } = await supabase
      .from("project_faqs")
      .insert(payload)
      .select();

    if (error) throw error;

    res.status(201).json(data);
  } catch (err) {
    console.error("Create FAQs error:", err);
    res.status(500).json({ error: "Failed to create FAQs" });
  }
};


export const getFAQsByProjectId = async (req, res) => {
  try {
    const { projectId } = req.params;

    const { data, error } = await supabase
      .from("project_faqs")
      .select("*")
      .eq("project_id", projectId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("Fetch FAQs error:", err);
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
};


export const deleteFAQ = async (req, res) => {
  try {
    const { faqId } = req.params;

    const { error } = await supabase
      .from("project_faqs")
      .delete()
      .eq("id", faqId);

    if (error) throw error;

    res.json({ message: "FAQ deleted" });
  } catch (err) {
    console.error("Delete FAQ error:", err);
    res.status(500).json({ error: "Failed to delete FAQ" });
  }
};