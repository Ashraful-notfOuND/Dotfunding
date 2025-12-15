import express from "express";
import { getUpdates, addUpdate, upvoteUpdate } from "../controllers/updatesController.js";

const router = express.Router();

// Fetch all updates for a project
router.get("/:projectId", getUpdates);

// Add a new update
router.post("/", addUpdate);

// Upvote an update
router.post("/upvote", upvoteUpdate);

export default router;
