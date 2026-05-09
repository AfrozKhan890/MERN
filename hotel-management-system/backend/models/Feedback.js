// backend/models/Feedback.js
const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest',
    required: true
  },
  reservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation'
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  categories: {
    cleanliness: { type: Number, min: 1, max: 5, default: 3 },
    service: { type: Number, min: 1, max: 5, default: 3 },
    comfort: { type: Number, min: 1, max: 5, default: 3 },
    location: { type: Number, min: 1, max: 5, default: 3 },
    valueForMoney: { type: Number, min: 1, max: 5, default: 3 }
  },
  title: {
    type: String,
    maxlength: 100
  },
  comment: {
    type: String,
    maxlength: 1000
  },
  suggestions: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Addressed', 'Closed'],
    default: 'Pending'
  },
  response: {
    message: String,
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    respondedAt: Date
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Feedback', feedbackSchema);