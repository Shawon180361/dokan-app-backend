// backend/src/routes/adminBannerRoutes.js
import express from "express";
import { 
  uploadBanner, 
  getAllBanners, 
  getBannerById, 
  updateBanner, 
  deleteBanner,
  clearBanners 
} from "../controllers/adminBannerController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// সব রুট শুধু অ্যাডমিনের জন্য
router.get("/", protect, admin, getAllBanners);                    // GET /api/admin/banners
router.get("/:id", protect, admin, getBannerById);                 // GET /api/admin/banners/:id
router.post("/", protect, admin, upload.single("banner"), uploadBanner);  // POST /api/admin/banners
router.put("/:id", protect, admin, upload.single("banner"), updateBanner); // PUT /api/admin/banners/:id
router.delete("/:id", protect, admin, deleteBanner);               // DELETE /api/admin/banners/:id
router.delete("/clear/all", protect, admin, clearBanners);         // DELETE /api/admin/banners/clear/all

export default router;