// backend/routes/roomRoutes.js
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect); // All room routes require authentication

router.get('/stats', roomController.getRoomStats);

router.route('/')
  .get(roomController.getRooms)
  .post(authorize('admin', 'manager'), roomController.createRoom);

router.route('/:id')
  .get(roomController.getRoom)
  .put(authorize('admin', 'manager'), roomController.updateRoom)
  .delete(authorize('admin'), roomController.deleteRoom);

router.put('/:id/status', roomController.updateRoomStatus);

module.exports = router;