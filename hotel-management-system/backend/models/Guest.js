// backend/models/Guest.js
const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Pakistan' }
  },
  identification: {
    idType: {
      type: String,
      enum: ['Passport', 'Driver License', 'National ID', 'Other']
    },
    idNumber: String,
    expiryDate: Date
  },
  preferences: {
    roomType: String,
    floor: String,
    smoking: { type: Boolean, default: false },
    specialNeeds: String
  },
  stayHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation'
  }],
  totalStays: {
    type: Number,
    default: 0
  },
  vipStatus: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['Active', 'Blacklisted', 'Inactive'],
    default: 'Active'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Virtual for full name
guestSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtuals are included in JSON output
guestSchema.set('toJSON', { virtuals: true });
guestSchema.set('toObject', { virtuals: true });

const Guest = mongoose.model('Guest', guestSchema);
module.exports = Guest;