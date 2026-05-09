const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Standard', 'Deluxe', 'Suite', 'Presidential'],
    required: [true, 'Room type is required']
  },
  floor: {
    type: String,
    required: [true, 'Floor is required']
  },
  status: {
    type: String,
    enum: ['Available', 'Occupied', 'Cleaning', 'Maintenance', 'Reserved'],
    default: 'Available'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  capacity: {
    type: Number,
    required: true,
    min: 1,
    max: 10
  },
  amenities: [{
    type: String,
    enum: ['WiFi', 'TV', 'Air Conditioning', 'Mini Bar', 'Room Service', 
           'Balcony', 'Jacuzzi', 'Kitchen', 'Workspace', 'Safe']
  }],
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  images: [{
    type: String
  }],
  lastCleaned: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Room', roomSchema);