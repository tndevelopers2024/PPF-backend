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
    year: {
      type: Number,
      required: true,
      index: true,
    },
    variant: {
      type: String,
    },
    category: {
      type: String,
      enum: [
        'Exterior Of Car',
        'Car Interior',
        'Motorcycles',
        'Window Film',
        'Mobile electronic equipment',
        'Pattern Logo Engraving',
        'Car partial protection kit',
        'External sunroof tint film',
      ],
      default: 'Exterior Of Car',
      index: true,
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
