// backend/routes/reservationRoutes.js
const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/today', reservationController.getTodayReservations);
router.route('/')
  .get(reservationController.getReservations)
  .post(reservationController.createReservation);

router.route('/:id')
  .get(reservationController.getReservation)
  .put(reservationController.updateReservation)
  .delete(authorize('admin', 'manager'), reservationController.deleteReservation);

router.put('/:id/checkin', reservationController.checkIn);
router.put('/:id/checkout', reservationController.checkOut);

module.exports = router;