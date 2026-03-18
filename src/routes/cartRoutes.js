import express from "express";
import {
  addToCart,
  getCart,
  removeFromCart,
  clearCart
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// সব রুট স্বয়ংক্রিয়ভাবে /api/cart এর under এ হবে
router.get("/", protect, getCart);              // GET /api/cart
router.post("/", protect, addToCart);           // POST /api/cart (এখানে '/cart' না, '/' হবে)
router.delete("/remove/:id", protect, removeFromCart); // DELETE /api/cart/remove/:id
router.delete("/clear", protect, clearCart);    // DELETE /api/cart/clear

export default router;