const Feedback = require('../models/Feedback');
const Guest = require('../models/Guest');
const Notification = require('../models/Notification');
const User = require('../models/User');

const emitRealtime = (req, event, payload) => {
  const io = req.app.get('io');
  if (io) {
    io.to('admins').emit(event, payload);
    io.emit(event, payload);
  }
};

// @desc    Get all feedback
// @route   GET /api/feedback
// @access  Private
const getFeedbacks = async (req, res) => {
  try {
    const { rating, status, page = 1, limit = 10 } = req.query;
    const filter = {};

    if (rating) filter.rating = parseInt(rating);
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const feedbacks = await Feedback.find(filter)
      .populate('guest', 'firstName lastName email')
      .populate('reservation', 'roomNumber checkIn checkOut')
      .populate('response.respondedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(filter);

    // Calculate average ratings
    const avgRatings = await Feedback.aggregate([
      { $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        avgCleanliness: { $avg: '$categories.cleanliness' },
        avgService: { $avg: '$categories.service' },
        avgComfort: { $avg: '$categories.comfort' },
        avgLocation: { $avg: '$categories.location' },
        avgValue: { $avg: '$categories.valueForMoney' },
        totalReviews: { $sum: 1 }
      }}
    ]);

    res.json({
      success: true,
      count: feedbacks.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      avgRatings: avgRatings[0] || {},
      data: feedbacks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private
const submitFeedback = async (req, res) => {
  try {
    const { guestId, reservationId, rating, categories, title, comment, suggestions } = req.body;

    if (!rating) {
      return res.status(400).json({ success: false, message: 'Rating is required' });
    }

    let guest = null;

    if (guestId) {
      guest = await Guest.findById(guestId);
    }

    if (!guest && req.user?.role === 'guest') {
      const [firstName, ...rest] = (req.user.name || 'Guest User').trim().split(' ');
      const lastName = rest.join(' ') || 'User';
      guest = await Guest.findOne({ email: req.user.email?.toLowerCase() });

      if (!guest) {
        guest = await Guest.create({
          firstName: firstName || 'Guest',
          lastName,
          email: req.user.email?.toLowerCase(),
          phone: req.user.phone || 'N/A',
          createdBy: req.user._id
        });
      }
    }

    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }

    const feedback = await Feedback.create({
      guest: guest._id,
      reservation: reservationId,
      rating,
      categories,
      title,
      comment,
      suggestions
    });

    // Notify admin/manager about new feedback
    const admins = await User.find({ role: { $in: ['admin', 'manager'] } });
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        type: 'feedback',
        title: 'New Guest Feedback',
        message: `${guest.firstName} ${guest.lastName} gave a ${rating}-star rating`,
        priority: 'medium',
        data: { guestId }
      });
    }

    emitRealtime(req, 'feedback-updated', {
      feedbackId: feedback._id,
      rating: feedback.rating,
      title: feedback.title
    });

    res.status(201).json({ success: true, message: 'Feedback submitted successfully', data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Respond to feedback
// @route   PUT /api/feedback/:id/respond
// @access  Private/Admin/Manager
const respondToFeedback = async (req, res) => {
  try {
    const { message } = req.body;

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ success: false, message: 'Feedback not found' });
    }

    feedback.response = {
      message,
      respondedBy: req.user._id,
      respondedAt: new Date()
    };
    feedback.status = 'Addressed';
    await feedback.save();

    res.json({ success: true, message: 'Response submitted', data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get feedback stats
// @route   GET /api/feedback/stats
// @access  Private
const getFeedbackStats = async (req, res) => {
  try {
    const totalReviews = await Feedback.countDocuments();
    const avgRating = await Feedback.aggregate([
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);

    const ratingDistribution = await Feedback.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    const recentFeedbacks = await Feedback.find()
      .populate('guest', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalReviews,
        averageRating: avgRating[0]?.avg?.toFixed(2) || 0,
        totalReviewsCount: avgRating[0]?.count || 0
      },
      ratingDistribution,
      recentFeedbacks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPublicFeedbacks = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const feedbacks = await Feedback.find({ isPublic: true })
      .populate('guest', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFeedbacks,
  submitFeedback,
  respondToFeedback,
  getFeedbackStats,
  getPublicFeedbacks
};