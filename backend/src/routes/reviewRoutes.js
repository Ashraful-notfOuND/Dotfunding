import express from "express";
import {
  createOrUpdateReview,
  getProjectReviews,
  getUserReview,
  deleteReview,
} from "../controllers/reviewController.js";

const router = express.Router();

// Create or update a review
router.post("/", createOrUpdateReview);

// Get all reviews for a project
router.get("/project/:projectId", getProjectReviews);

// Get user's review for a specific project
router.get("/project/:projectId/user/:userId", getUserReview);

// Delete a review
router.delete("/:reviewId", deleteReview);

export default router;
