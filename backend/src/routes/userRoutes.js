import express from "express";
import { signUpUser, loginUser, updateProfile, getUserById } from "../controllers/userController.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post("/signup", signUpUser);
router.post("/login", loginUser);

router.post("/update-profile", upload.single("profilePic"), updateProfile);
// Get user by id (public)
router.get("/:id", getUserById);

export default router;
