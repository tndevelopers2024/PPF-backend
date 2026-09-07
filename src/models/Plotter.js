import mongoose from 'mongoose';

const plotterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },
    ipAddress: {
      type: String,
      required: true,
      trim: true,
    },
    port: {
      type: Number,
      default: 9100,
    },
    status: {
      type: String,
      enum: ['online', 'offline', 'cutting', 'error'],
      default: 'online',
    },
    filmWidth: {
      type: Number,
      default: 1524, // 60 inches
    },
    location: {
      type: String,
      default: 'Bay 1',
    },
    lastSeen: {
      type: Date,
      default: Date.now,
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

const Plotter = mongoose.model('Plotter', plotterSchema);

export default Plotter;
