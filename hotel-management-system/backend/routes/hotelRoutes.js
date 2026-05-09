// backend/routes/hotelRoutes.js (CREATE THIS FILE)
const express = require('express');
const router = express.Router();
const {
  getHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
  getHotelStats
} = require('../controllers/hotelController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Public routes (for gallery - guests can view)
router.get('/', getHotels);
router.get('/stats', getHotelStats);
router.get('/:id', getHotel);

// Admin only routes
router.post('/', protect, authorize('admin', 'manager'), createHotel);
router.put('/:id', protect, authorize('admin', 'manager'), updateHotel);
router.delete('/:id', protect, authorize('admin'), deleteHotel);

module.exports = router;