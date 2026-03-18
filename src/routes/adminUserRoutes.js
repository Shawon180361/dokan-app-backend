// backend/src/routes/adminUserRoutes.js
import express from 'express';
import { 
  getAllUsers, 
  getUserById, 
  updateUser, 
  deleteUser,
  updateUserRole 
} from '../controllers/adminUserController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// সব ইউজার রুট - শুধু অ্যাডমিনের জন্য
router.get('/', protect, admin, getAllUsers);           // GET /api/admin/users
router.get('/:id', protect, admin, getUserById);       // GET /api/admin/users/:id
router.put('/:id', protect, admin, updateUser);        // PUT /api/admin/users/:id
router.put('/:id/role', protect, admin, updateUserRole); // PUT /api/admin/users/:id/role
router.delete('/:id', protect, admin, deleteUser);     // DELETE /api/admin/users/:id

export default router;