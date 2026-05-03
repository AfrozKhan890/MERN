// backend/routes/reportRoutes.js
const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin', 'manager'));

router.get('/dashboard', reportController.getDashboardStats);
router.get('/occupancy', reportController.getOccupancyReport);
router.get('/revenue', reportController.getRevenueReport);

router.get('/guests', reportController.getGuestReport);
router.get('/staff', reportController.getStaffReport);

module.exports = router;