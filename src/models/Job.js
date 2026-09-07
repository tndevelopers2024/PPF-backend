import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    installerId: {
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
    patterns: [
      {
        patternId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Pattern',
        },
        name: String,
        transform: {
          left: Number,
          top: Number,
          scaleX: Number,
          scaleY: Number,
          angle: Number,
          flipX: Boolean,
          flipY: Boolean,
        },
      },
    ],
    plotterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Plotter', // Will be built in Phase 8
    },
    filmWidth: {
      type: Number,
      required: true,
    },
    materialUsed: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'cutting', 'completed', 'failed', 'canceled'],
      default: 'queued',
      index: true,
    },
    errorDetails: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Job = mongoose.model('Job', jobSchema);

export default Job;
