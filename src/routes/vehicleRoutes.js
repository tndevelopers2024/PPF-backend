import express from 'express';
import {
  getVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicleController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Search and get vehicles (accessible to all authenticated users)
router.route('/').get(protect, getVehicles);
router.route('/:id').get(protect, getVehicleById);

// Admin only routes for managing vehicles
router
  .route('/')
  .post(protect, authorize('SUPER_ADMIN', 'ADMIN'), createVehicle);

router
  .route('/:id')
  .put(protect, authorize('SUPER_ADMIN', 'ADMIN'), updateVehicle)
  .delete(protect, authorize('SUPER_ADMIN', 'ADMIN'), deleteVehicle);

export default router;
