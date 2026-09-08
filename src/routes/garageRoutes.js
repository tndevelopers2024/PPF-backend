import express from 'express';
import {
  getGarageItems,
  addToGarage,
  updateGarageItem,
  deleteGarageItem,
  checkInGarage,
} from '../controllers/garageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getGarageItems)
  .post(protect, addToGarage);

router.route('/check/:vehicleId')
  .get(protect, checkInGarage);

router.route('/:id')
  .put(protect, updateGarageItem)
  .delete(protect, deleteGarageItem);

export default router;
