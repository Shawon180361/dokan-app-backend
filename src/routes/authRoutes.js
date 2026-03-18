import express from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
} from "../controllers/authController.js";
import { validate, validateRegister, validateLogin } from "../middleware/validation.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js"; // ✅ Import here

const router = express.Router();


// ================= AUTH =================
router.post("/register", validate(validateRegister), registerUser);
router.post("/login", validate(validateLogin), loginUser);

// ================= PROFILE =================
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, upload.single("profilePic"), updateUserProfile); // ✅ fixed

export default router;