import mongoose from 'mongoose';

const patternSchema = new mongoose.Schema(
  {
    vehicleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vehicle',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    part: {
      type: String,
      required: true,
      index: true,
    },
    patternType: {
      type: String,
    },
    files: {
      svg: {
        url: String,
        key: String,
      },
      dxf: {
        url: String,
        key: String,
      },
    },
    preview: {
      url: String,
      key: String,
    },
    dimensions: {
      width: Number,
      height: Number,
      unit: {
        type: String,
        default: 'mm',
      },
    },
    version: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ['draft', 'testing', 'published', 'archived'],
      default: 'draft',
      index: true,
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

const Pattern = mongoose.model('Pattern', patternSchema);

export default Pattern;
