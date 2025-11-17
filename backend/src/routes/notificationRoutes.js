import express from "express";
import { createNotification, getNotifications, markNotificationsRead } from "../controllers/notificationController.js";

const router = express.Router();

// Create a new notification
router.post("/", createNotification);

// Get notifications for a user
router.get("/:userId", getNotifications);

router.put("/mark-read/:userId", markNotificationsRead);

export default router;
