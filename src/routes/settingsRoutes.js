import express from 'express';
import { getSystemSettings, updateSystemSettings } from '../controllers/settingsController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getSystemSettings)
  .put(protect, authorize('SUPER_ADMIN', 'ADMIN'), updateSystemSettings);

export default router;
