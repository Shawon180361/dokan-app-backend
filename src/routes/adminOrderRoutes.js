// backend/routes/adminOrderRoutes.js
import express from 'express';
import { 
  getAllAdminOrders,
  getAdminOrderById,
  updateOrderStatusByAdmin,
  deleteOrderByAdmin
} from '../controllers/adminOrderController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, admin, getAllAdminOrders);                 // GET /api/admin/orders
router.get('/:id', protect, admin, getAdminOrderById);              // GET /api/admin/orders/:id
router.put('/:id/status', protect, admin, updateOrderStatusByAdmin); // PUT /api/admin/orders/:id/status
router.delete('/:id', protect, admin, deleteOrderByAdmin);          // DELETE /api/admin/orders/:id

export default router;