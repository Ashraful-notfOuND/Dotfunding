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
  getPersonalizedRecommendationsWithNotifications,
  notifyUsersAboutProject,
} from "../controllers/recommendationController.js";

const router = express.Router();

// Recommendation endpoints
router.get("/recommendations/:userId", getRecommendations);
router.get("/recommendations/:userId/combined", getCombinedRecommendations);

// PATTERN DEMONSTRATION ENDPOINT
// Demonstrates all 4 design patterns working together
router.get("/recommendations/:userId/personalized", getPersonalizedRecommendationsWithNotifications);

// Subscription endpoints
router.post("/subscriptions/:projectId/:userId", subscribeToProject);
router.delete("/subscriptions/:projectId/:userId", unsubscribeFromProject);
router.get("/subscriptions/user/:userId", getUserSubscriptions);

// Convenience endpoints for frontend
router.post("/subscribe", (req, res) => {
  const { userId, projectId } = req.body;
  req.params = { userId, projectId };
  return subscribeToProject(req, res);
});

router.post("/unsubscribe", (req, res) => {
  const { userId, projectId } = req.body;
  req.params = { userId, projectId };
  return unsubscribeFromProject(req, res);
});

// User interests endpoints
router.get("/interests/:userId", getUserInterests);
router.put("/interests/:userId", updateUserInterests);

// Notification preferences endpoints
router.put("/preferences/:userId", updateNotificationPreferences);

// Manual notification trigger (demonstrates Observer pattern)
router.post("/notify/project/:projectId", notifyUsersAboutProject);

export default router;
