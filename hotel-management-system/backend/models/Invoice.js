// backend/models/Invoice.js
const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true
  },
  reservation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Reservation',
    required: true
  },
  guest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Guest',           // ✅ Changed from 'User' to 'Guest'
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
    default: 'Draft'
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

invoiceSchema.pre('save', async function(next) {
  if (this.isNew) {
    const count = await mongoose.model('Invoice').countDocuments();
    this.invoiceNumber = `INV-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);