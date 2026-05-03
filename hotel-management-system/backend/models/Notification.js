// backend/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['booking', 'checkin', 'checkout', 'maintenance', 'cleaning', 'payment', 'system', 'feedback'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    reservationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'HousekeepingTask' },
    invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest' }
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for faster queries
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);