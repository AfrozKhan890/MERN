// backend/models/Invoice.js - COMPLETE FIXED
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    unique: true,
    sparse: true  // Allows null values, prevents duplicate key error
  },
  reservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    required: true
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest',
    required: true
  },
  roomCharges: {
    type: Number,
    required: true,
    min: 0
  },
  additionalServices: [{
    description: String,
    amount: Number,
    date: Date
  }],
  additionalChargesTotal: {
    type: Number,
    default: 0
  },
  taxRate: {
    type: Number,
    default: 15
  },
  taxAmount: {
    type: Number,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paidAmount: {
    type: Number,
    default: 0
  },
  balance: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Draft', 'Issued', 'Paid', 'Partially Paid', 'Cancelled'],
    default: 'Issued'
  },
  issuedDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date
  },
  paymentHistory: [{
    amount: Number,
    method: String,
    date: Date,
    reference: String
  }],
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Generate unique invoice number before saving
invoiceSchema.pre('save', async function(next) {
  if (this.isNew && !this.invoiceNumber) {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.invoiceNumber = `INV-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);