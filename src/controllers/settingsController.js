import SystemSetting from '../models/SystemSetting.js';

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private
export const getSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne({ key: 'global' });
    if (!settings) {
      settings = await SystemSetting.create({ key: 'global' });
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private (Admin only)
export const updateSystemSettings = async (req, res) => {
  try {
    let settings = await SystemSetting.findOne({ key: 'global' });
    if (!settings) {
      settings = new SystemSetting({ key: 'global' });
    }

    const fields = [
      'platformName',
      'supportEmail',
      'allowRegistrations',
      'maintenanceMode',
      'maxUploadSizeMB',
      'defaultDxfUnit',
      'bezierTolerance',
      'autoConvertDxf',
      'defaultPlotterPort',
      'heartbeatIntervalSec',
      'logRetentionDays',
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        settings[field] = req.body[field];
      }
    });

    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
