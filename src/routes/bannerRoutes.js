import express from "express";
import { uploadBanner, getActiveBanners, clearBanners } from "../controllers/bannerController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Admin uploads banner image
router.post("/admin/upload-banner", protect, admin, upload.single("banner"), uploadBanner);

// Get all active banners (public)
router.get("/banners", getActiveBanners);

// Optional: clear all banners (admin)
router.delete("/admin/clear-banners", protect, admin, clearBanners);

export default router;