import express from "express";
import {
  addProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  addReview,
  getProductsAdvanced,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// PUBLIC ROUTES
router.get("/", getProducts);
router.get("/search/advanced", getProductsAdvanced);
router.get("/:id", getProductById);

// PROTECTED ROUTES
router.post("/add", protect, admin, upload.single("images"), addProduct);
router.put("/:id", protect, admin, upload.single("images"), updateProduct);
router.delete("/:id", protect, admin, deleteProduct);
router.post("/:id/review", protect, addReview);


export default router;