import express from "express";
import { requireAdmin } from "../middleware/adminAuth.js";
import {
  getPendingProjects,
  getAllProjectsAdmin,
  approveProject,
  rejectProject,
  pauseProject,
  resumeProject,
  removeProject,
  getAdminStats,
  getProjectReviewHistory
} from "../controllers/adminController.js";

const router = express.Router();

// All routes require admin authentication
// You can apply middleware globally or per route

/**
 * GET /api/admin/stats
 * Get admin dashboard statistics
 */
router.get("/stats", requireAdmin, getAdminStats);

/**
 * GET /api/admin/projects/pending
 * Get all pending projects awaiting review
 */
router.get("/projects/pending", requireAdmin, getPendingProjects);

/**
 * GET /api/admin/projects
 * Get all projects (with optional status filter)
 * Query params: ?status=pending|approved|rejected|paused|removed
 */
router.get("/projects", requireAdmin, getAllProjectsAdmin);

/**
 * GET /api/admin/projects/:project_id/history
 * Get review history for a specific project
 */
router.get("/projects/:project_id/history", requireAdmin, getProjectReviewHistory);

/**
 * POST /api/admin/projects/:project_id/approve
 * Approve a pending project
 * Body: { admin_id, message? }
 */
router.post("/projects/:project_id/approve", requireAdmin, approveProject);

/**
 * POST /api/admin/projects/:project_id/reject
 * Reject a pending project
 * Body: { admin_id, message (required) }
 */
router.post("/projects/:project_id/reject", requireAdmin, rejectProject);

/**
 * POST /api/admin/projects/:project_id/pause
 * Pause a live project
 * Body: { admin_id, message? }
 */
router.post("/projects/:project_id/pause", requireAdmin, pauseProject);

/**
 * POST /api/admin/projects/:project_id/resume
 * Resume a paused project
 * Body: { admin_id, message? }
 */
router.post("/projects/:project_id/resume", requireAdmin, resumeProject);

/**
 * POST /api/admin/projects/:project_id/remove
 * Permanently remove a project
 * Body: { admin_id, message (required) }
 */
router.post("/projects/:project_id/remove", requireAdmin, removeProject);

export default router;
