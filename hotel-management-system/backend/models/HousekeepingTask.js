// // backend/models/Housekeeping.js
// const mongoose = require('mongoose');

// const housekeepingSchema = new mongoose.Schema({
//   room: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Room',
//     required: true
//   },
//   taskType: {
//     type: String,
//     enum: ['Cleaning', 'Maintenance', 'Inspection', 'Restocking'],
//     required: true
//   },
//   priority: {
//     type: String,
//     enum: ['Low', 'Medium', 'High', 'Urgent'],
//     default: 'Medium'
//   },
//   status: {
//     type: String,
//     enum: ['Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'],
//     default: 'Pending'
//   },
//   assignedTo: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   requestedBy: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   scheduledDate: {
//     type: Date,
//     required: true
//   },
//   completedDate: {
//     type: Date
//   },
//   description: {
//     type: String,
//     maxlength: 500
//   },
//   notes: {
//     type: String
//   },
//   supplies: [{
//     item: String,
//     quantity: Number,
//     unit: String
//   }]
// }, {
//   timestamps: true
// });

// const Housekeeping = mongoose.model('Housekeeping', housekeepingSchema);
// module.exports = Housekeeping;


// models/HousekeepingTask.js
const mongoose = require('mongoose');

const housekeepingTaskSchema = new mongoose.Schema({
  room: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  roomNumber: {
    type: String,
    required: true
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  taskType: {
    type: String,
    enum: ['Cleaning', 'Deep Cleaning', 'Turndown', 'Linen Change', 'Inspection'],
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  status: {
    type: String,
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    default: 'Pending'
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  completedDate: {
    type: Date
  },
  notes: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HousekeepingTask', housekeepingTaskSchema);