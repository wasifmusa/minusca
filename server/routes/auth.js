import { Router } from 'express';
import { login, createUser } from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/login', login);
router.post('/users', protect, adminOnly, createUser); // Only admins can create users

export default router;
