// backend/routes/wishlistRoutes.js
import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  checkWishlist,
  clearWishlist
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getWishlist);
router.post('/add', protect, addToWishlist);
router.delete('/remove/:itemId', protect, removeFromWishlist);
router.get('/check/:productId', protect, checkWishlist);
router.delete('/clear', protect, clearWishlist);

export default router;