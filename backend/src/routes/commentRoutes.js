import express from "express";
import { getComments, addComment, likeComment } from "../controllers/commentsController.js";

const router = express.Router();

// Fetch all comments with replies
router.get("/", getComments);

// Add a new comment or reply
router.post("/", addComment);

// Like a comment or reply
router.post("/like", likeComment);

export default router;