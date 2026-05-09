// backend/models/SystemSettings.js
const mongoose = require('mongoose');

const systemSettingsSchema = new mongoose.Schema({
  hotelName: {
    type: String,
    default: 'LuxuryStay Hospitality'
  },
  address: {
    street: { type: String, default: '123 Hotel Street' },
    city: { type: String, default: 'Karachi' },
    state: { type: String, default: 'Sindh' },
    country: { type: String, default: 'Pakistan' },
    zipCode: { type: String, default: '74000' }
  },
  contact: {
    phone: { type: String, default: '(555) 123-4567' },
    email: { type: String, default: 'info@luxurystay.com' },
    website: { type: String, default: 'www.luxurystay.com' }
  },
  roomDefaults: {
    standardPrice: { type: Number, default: 100 },
    deluxePrice: { type: Number, default: 200 },
    suitePrice: { type: Number, default: 500 },
    presidentialPrice: { type: Number, default: 1000 },
    maxCapacity: { type: Number, default: 6 }
  },
  taxSettings: {
    taxRate: { type: Number, default: 15 },
    serviceCharge: { type: Number, default: 5 },
    includeTaxInPrice: { type: Boolean, default: false }
  },
  bookingSettings: {
    autoConfirm: { type: Boolean, default: false },
    maxAdvanceDays: { type: Number, default: 365 },
    minStayHours: { type: Number, default: 24 },
    checkInTime: { type: String, default: '14:00' },
    checkOutTime: { type: String, default: '12:00' },
    cancellationHours: { type: Number, default: 24 }
  },
  notifications: {
    emailNotifications: { type: Boolean, default: true },
    smsNotifications: { type: Boolean, default: false },
    notifyOnBooking: { type: Boolean, default: true },
    notifyOnCheckout: { type: Boolean, default: true },
    notifyOnMaintenance: { type: Boolean, default: true }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SystemSettings', systemSettingsSchema);