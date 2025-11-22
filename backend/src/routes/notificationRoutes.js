import express from "express";
import { createNotification, getNotifications, markNotificationsRead, markNotificationRead } from "../controllers/notificationController.js";

const router = express.Router();

// Create a new notification
router.post("/", createNotification);

// Get notifications for a user
router.get("/:userId", getNotifications);

// Mark all notifications as read for a user
router.put("/mark-read/:userId", markNotificationsRead);

// Mark a single notification as read
router.put("/:notificationId/read", markNotificationRead);

export default router;
