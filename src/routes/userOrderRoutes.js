// backend/routes/userOrderRoutes.js
import express from "express";
import {
  createUserOrder,
  getUserOrders,
  getUserOrderById,
  cancelUserOrder
} from "../controllers/userOrderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createUserOrder);              // POST /api/user/orders
router.get("/my-orders", protect, getUserOrders);        // GET /api/user/orders/my-orders
router.get("/:id", protect, getUserOrderById);           // GET /api/user/orders/:id
router.put("/:id/cancel", protect, cancelUserOrder);     // PUT /api/user/orders/:id/cancel

export default router;