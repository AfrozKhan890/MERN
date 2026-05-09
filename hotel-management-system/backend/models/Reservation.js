// backend/models/Reservation.js - COMPLETE FIXED (No reservationNumber)
const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest',
    required: true
  },
  guestName: {
    type: String,
    required: [true, 'Guest name is required']
  },
  email: {
    type: String,
    required: [true, 'Email is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  checkIn: {
    type: Date,
    required: [true, 'Check-in date is required']
  },
  checkOut: {
    type: Date,
    required: [true, 'Check-out date is required']
  },
  adults: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  children: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled'],
    default: 'Pending'
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Paid', 'Refunded', 'Partially Paid'],
    default: 'Pending'
  },
  paymentMethod: {
    type: String,
    enum: ['Credit Card', 'Debit Card', 'Cash', 'Bank Transfer'],
    default: 'Credit Card'
  },
  specialRequests: {
    type: String,
    maxlength: 500
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Pre-save validation
reservationSchema.pre('save', function(next) {
  if (this.checkOut <= this.checkIn) {
    return next(new Error('Check-out date must be after check-in date'));
  }
  next();
});

// Remove index creation for reservationNumber (doesn't exist now)
module.exports = mongoose.model('Reservation', reservationSchema);