import express from "express";
import {
  getRecommendations,
  getCombinedRecommendations,
  subscribeToProject,
  unsubscribeFromProject,
  getUserSubscriptions,
  updateUserInterests,
  getUserInterests,
  updateNotificationPreferences,
} from "../controllers/recommendationController.js";

const router = express.Router();

// Recommendation endpoints
router.get("/recommendations/:userId", getRecommendations);
router.get("/recommendations/:userId/combined", getCombinedRecommendations);

// Subscription endpoints
router.post("/subscriptions/:projectId/:userId", subscribeToProject);
router.delete("/subscriptions/:projectId/:userId", unsubscribeFromProject);
router.get("/subscriptions/user/:userId", getUserSubscriptions);

// User interests endpoints
router.get("/interests/:userId", getUserInterests);
router.put("/interests/:userId", updateUserInterests);

// Notification preferences endpoints
router.put("/preferences/:userId", updateNotificationPreferences);

export default router;
