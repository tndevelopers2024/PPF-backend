import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: 'global',
    },
    platformName: {
      type: String,
      default: 'PPF Cutting Platform',
    },
    supportEmail: {
      type: String,
      default: 'admin@ppfcutting.com',
    },
    allowRegistrations: {
      type: Boolean,
      default: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maxUploadSizeMB: {
      type: Number,
      default: 50,
    },
    defaultDxfUnit: {
      type: String,
      enum: ['mm', 'in'],
      default: 'mm',
    },
    bezierTolerance: {
      type: Number,
      default: 0.05,
    },
    autoConvertDxf: {
      type: Boolean,
      default: true,
    },
    defaultPlotterPort: {
      type: Number,
      default: 9100,
    },
    heartbeatIntervalSec: {
      type: Number,
      default: 60,
    },
    logRetentionDays: {
      type: Number,
      default: 90,
    },
  },
  {
    timestamps: true,
  }
);

const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);

export default SystemSetting;
