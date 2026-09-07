import express from 'express';
import {
  getPatterns,
  getPatternById,
  createPattern,
  updatePattern,
  deletePattern,
  uploadPatternFile,
} from '../controllers/patternController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/').get(protect, getPatterns);
router.route('/:id').get(protect, getPatternById);

router
  .route('/')
  .post(protect, authorize('SUPER_ADMIN', 'ADMIN'), createPattern);

router
  .route('/:id')
  .put(protect, authorize('SUPER_ADMIN', 'ADMIN'), updatePattern)
  .delete(protect, authorize('SUPER_ADMIN', 'ADMIN'), deletePattern);

// File upload: POST /api/patterns/:id/upload
// multipart/form-data with field name "file"
router
  .route('/:id/upload')
  .post(protect, authorize('SUPER_ADMIN', 'ADMIN'), upload.single('file'), uploadPatternFile);

export default router;
