// backend/routes/billingRoutes.js (REPLACE EXISTING)
const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  processPayment,
  getRevenueReport
} = require('../controllers/billingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// Revenue report
router.get('/revenue', authorize('admin', 'manager'), getRevenueReport);

// CRUD routes
router.route('/')
  .get(getInvoices)
  .post(authorize('admin', 'manager', 'receptionist'), createInvoice);

router.route('/:id')
  .get(getInvoice)
  .put(authorize('admin', 'manager'), updateInvoice);

// Payment route
router.put('/:id/pay', processPayment);

module.exports = router;