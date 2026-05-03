// backend/controllers/settingsController.js
const SystemSettings = require('../models/SystemSettings');

// @desc    Get system settings (create default if not exists)
// @route   GET /api/settings
// @access  Private/Admin
const getSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();

    if (!settings) {
      settings = await SystemSettings.create(req.body);
    } else {
      const updateFields = [
        'hotelName', 'address', 'contact', 'roomDefaults',
        'taxSettings', 'bookingSettings', 'notifications'
      ];

      updateFields.forEach(field => {
        if (req.body[field] !== undefined) {
          settings[field] = req.body[field];
        }
      });

      settings.updatedBy = req.user._id;
      await settings.save();
    }

    res.json({ success: true, message: 'Settings updated', data: settings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getSettings, updateSettings };