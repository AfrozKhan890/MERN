// backend/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const {
  getAdminDashboard,
  getManagerDashboard,
  getStaffDashboard
} = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/admin', authorize('admin'), getAdminDashboard);
router.get('/manager', authorize('manager'), getManagerDashboard);
router.get('/staff', getStaffDashboard);

module.exports = router;