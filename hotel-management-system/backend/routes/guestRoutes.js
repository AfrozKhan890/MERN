// backend/routes/guestRoutes.js
const express = require('express');
const router = express.Router();
const {
  getGuests,
  getGuest,
  createGuest,
  updateGuest,
  deleteGuest,
  getGuestStats,
  searchGuests
} = require('../controllers/guestController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Stats route (must be before /:id to avoid conflict)
router.get('/stats', getGuestStats);
router.get('/search', searchGuests);

// Main CRUD routes
router.route('/')
  .get(getGuests)
  .post(createGuest);

router.route('/:id')
  .get(getGuest)
  .put(updateGuest)
  .delete(authorize('admin', 'manager'), deleteGuest);

module.exports = router;