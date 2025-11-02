import express from "express";
import { createProject, createCampaign, getUserProjects, getProjectById, createRewards, getRewards, getCampaignByProjectId, createFAQs, getFAQsByProjectId, getAllProjects, getProjectCreator } from "../controllers/projectController.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();


router.post("/create", upload.single("image"), createProject);
// Public: get all projects for homepage
router.get("/", getAllProjects);
router.post("/campaign", upload.array("images"), createCampaign);
router.post("/faqs", createFAQs);
router.post("/rewards", express.json(), createRewards);
router.get("/rewards/:projectId", getRewards);
router.get("/userProjects/:userId", getUserProjects);
router.get("/:id", getProjectById);
router.get("/campaign/:projectId", getCampaignByProjectId);
router.get("/faqs/:projectId", getFAQsByProjectId);
router.get("/creator/:projectId", getProjectCreator);
export default router;


