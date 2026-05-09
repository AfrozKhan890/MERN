// backend/routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  getUnreadCount
} = require('../controllers/notificationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/unread-count', getUnreadCount);
router.put('/read-all', markAllAsRead);

router.route('/')
  .get(getNotifications)
  .post(authorize('admin', 'manager'), createNotification);

router.put('/:id/read', markAsRead);

module.exports = router;