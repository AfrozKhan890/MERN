// models/MaintenanceRequest.js
const mongoose = require('mongoose');

const maintenanceRequestSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  issue: {
    type: String,
    required: [true, 'Please describe the issue']
  },
  category: {
    type: String,
    enum: ['Plumbing', 'Electrical', 'HVAC', 'Furniture', 'Appliance', 'Other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Reported', 'Assigned', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Reported'
  },
  completedDate: {
    type: Date
  },
  cost: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);