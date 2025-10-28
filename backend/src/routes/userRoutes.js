import express from "express";
import { signUpUser, loginUser, updateProfile } from "../controllers/userController.js";
import multer from "multer";

const upload = multer({ storage: multer.memoryStorage() });

const router = express.Router();

router.post("/signup", signUpUser);
router.post("/login", loginUser);

router.post("/update-profile", upload.single("profilePic"), updateProfile);

export default router;
