import express from "express";
import { createProject, createCampaign, getUserProjects, getProjectById, createRewards, getRewards } from "../controllers/projectController.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();


router.post("/create", upload.single("image"), createProject);
//router.get("/all", getAllProjects);
router.post("/campaign", upload.array("images"), createCampaign);
router.post("/rewards", express.json(), createRewards);
router.get("/rewards/:projectId", getRewards);
router.get("/userProjects/:userId", getUserProjects);
router.get("/:id", getProjectById);
export default router;
