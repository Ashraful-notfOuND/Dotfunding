import express from "express";
import { createProject, createCampaign, getUserProjects } from "../controllers/projectController.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();


router.post("/create", upload.single("image"), createProject);
//router.get("/all", getAllProjects);
router.post("/campaign", upload.array("images"), createCampaign);
router.get("/userProjects/:userId", getUserProjects);
export default router;
