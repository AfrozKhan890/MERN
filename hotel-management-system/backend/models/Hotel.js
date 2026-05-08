// backend/models/Hotel.js (NEW FILE)
const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Hotel name is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: 1000
  },
  images: [{
    type: String,
    required: true
  }],
  rating: {
    type: Number,
    default: 4.5,
    min: 1,
    max: 5
  },
  amenities: [{
    type: String
  }],
  rooms: [{
    roomNumber: String,
    type: { type: String, enum: ['Standard', 'Deluxe', 'Suite', 'Presidential'] },
    price: Number,
    capacity: Number,
    status: { type: String, enum: ['Available', 'Occupied', 'Reserved', 'Maintenance'], default: 'Available' },
    description: String
  }],
  contactPhone: String,
  contactEmail: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Hotel', hotelSchema);