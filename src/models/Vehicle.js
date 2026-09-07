import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema(
  {
    manufacturer: {
      type: String,
      required: true,
      index: true,
    },
    model: {
      type: String,
      required: true,
      index: true,
    },
    generation: {
      type: String,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    variant: {
      type: String,
    },
    bodyType: {
      type: String,
    },
    market: {
      type: String,
    },
    image: {
      url: String,
      key: String,
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'inactive', 'archived'],
      default: 'draft',
    },
    notes: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for searching
vehicleSchema.index({ manufacturer: 1, model: 1, year: 1 });

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

export default Vehicle;
