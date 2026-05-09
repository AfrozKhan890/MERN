// backend/routes/maintenanceRoutes.js
const express = require('express');
const router = express.Router();
const {
  getRequests,
  getRequest,
  createRequest,
  updateRequest,
  assignRequest,
  completeRequest
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.route('/')
  .get(authorize('admin', 'manager'), getRequests)
  .post(createRequest);

router.get('/my-requests', getRequests); // For staff view

router.route('/:id')
  .get(getRequest)
  .put(authorize('admin', 'manager'), updateRequest);

router.put('/:id/assign', authorize('admin', 'manager'), assignRequest);
router.put('/:id/complete', completeRequest);

module.exports = router;