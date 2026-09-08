import mongoose from 'mongoose';

const garageItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
    },
    customerName: {
      type: String,
      default: '',
      trim: true,
    },
    customerPhone: {
      type: String,
      default: '',
      trim: true,
    },
    licensePlate: {
      type: String,
      default: '',
      trim: true,
    },
    vin: {
      type: String,
      default: '',
      trim: true,
    },
    selectedPackage: {
      type: String,
      default: 'Full Front PPF',
      trim: true,
    },
    status: {
      type: String,
      enum: ['booked', 'in_shop', 'ready_to_cut', 'cutting', 'completed'],
      default: 'in_shop',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'urgent'],
      default: 'normal',
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const GarageItem = mongoose.model('GarageItem', garageItemSchema);

export default GarageItem;
