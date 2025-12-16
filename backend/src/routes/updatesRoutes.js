import express from "express";
import { getUpdates, addUpdate, upvoteUpdate, deleteUpdate } from "../controllers/updatesController.js";

const router = express.Router();

// Fetch all updates for a project
router.get("/:projectId", getUpdates);

// Add a new update
router.post("/", addUpdate);

// Upvote an update
router.post("/upvote", upvoteUpdate);

// Delete a single update (project owner only)
router.delete("/item/:updateId", deleteUpdate);

export default router;
