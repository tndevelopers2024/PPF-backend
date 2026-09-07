import express from 'express';
import {
  getPlotters,
  getPlotterById,
  createPlotter,
  updatePlotter,
  deletePlotter,
  testPlotterConnection,
} from '../controllers/plotterController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router
  .route('/')
  .get(protect, getPlotters)
  .post(protect, authorize('SUPER_ADMIN', 'ADMIN'), createPlotter);

router
  .route('/:id')
  .get(protect, getPlotterById)
  .put(protect, authorize('SUPER_ADMIN', 'ADMIN'), updatePlotter)
  .delete(protect, authorize('SUPER_ADMIN', 'ADMIN'), deletePlotter);

router
  .route('/:id/test')
  .post(protect, testPlotterConnection);

export default router;
