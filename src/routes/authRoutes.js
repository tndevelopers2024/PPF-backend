import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

// Example of a protected route using role-based access control
router.get('/admin-only', protect, authorize('SUPER_ADMIN', 'ADMIN'), (req, res) => {
  res.json({ message: 'Welcome Admin' });
});

export default router;
