// backend/routes/couponRoutes.js

import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  createCoupon,
  getAllCoupons,
  getAvailableCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  applyCoupon,
  checkCoupon
} from '../controllers/couponController.js';

const router = express.Router();

// ✅ IMPORTANT: স্পেসিফিক routes প্রথমে, প্যারামিটার routes পরে

// Public/User routes (স্পেসিফিক)
router.get('/available', protect, getAvailableCoupons);  // ✅ এইটা প্রথমে
router.post('/check', protect, checkCoupon);
router.post('/apply', protect, applyCoupon);

// Admin routes (এগুলোও স্পেসিফিক)
router.route('/')
  .get(protect, admin, getAllCoupons)
  .post(protect, admin, createCoupon);

// Parameter routes (ডায়নামিক) - সবশেষে
router.route('/:id')
  .get(protect, admin, getCouponById)
  .put(protect, admin, updateCoupon)
  .delete(protect, admin, deleteCoupon);

export default router;