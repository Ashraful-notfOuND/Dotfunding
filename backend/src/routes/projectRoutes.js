import express from "express";
import { createProject, getAllProjects } from "../controllers/projectController.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();


router.post("/create", upload.array("images"), createProject);
router.get("/all", getAllProjects);

export default router;
