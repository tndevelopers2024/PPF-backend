import express from 'express';
import {
  getJobs,
  getJobById,
  createJob,
  updateJobStatus,
  getDashboardStats,
} from '../controllers/jobController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard-stats', protect, getDashboardStats);
router.route('/').get(protect, getJobs).post(protect, createJob);
router.route('/:id').get(protect, getJobById);

// Status updates usually restricted to Admin or system API
router
  .route('/:id/status')
  .put(protect, authorize('SUPER_ADMIN', 'ADMIN'), updateJobStatus);

export default router;
