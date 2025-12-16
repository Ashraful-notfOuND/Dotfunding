import express from "express";
import {
  getFAQsByProjectId,
  createFAQ,
  deleteFAQ,
} from "../controllers/faqController.js";

const router = express.Router();

// Fetch all FAQs for a project
router.get("/:projectId", getFAQsByProjectId);

// Add a new FAQ (project owner only)
router.post("/", createFAQ);

// Delete a single FAQ (project owner only)
router.delete("/item/:faqId", deleteFAQ);

export default router;
