// backend/routes/feedbackRoutes.js
const express = require('express');
const router = express.Router();
const {
  getFeedbacks,
  submitFeedback,
  respondToFeedback,
  getFeedbackStats,
  getPublicFeedbacks
} = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/public', getPublicFeedbacks);

router.use(protect);

router.get('/stats', getFeedbackStats);

router.route('/')
  .get(getFeedbacks)
  .post(submitFeedback);

router.put('/:id/respond', authorize('admin', 'manager'), respondToFeedback);

module.exports = router;