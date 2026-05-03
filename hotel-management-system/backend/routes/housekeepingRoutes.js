// backend/routes/housekeepingRoutes.js
const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  completeTask,
  assignTask,
  getMyTasks
} = require('../controllers/housekeepingController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// My tasks route
router.get('/my-tasks', getMyTasks);

// Main CRUD routes
router.route('/')
  .get(getTasks)
  .post(authorize('admin', 'manager', 'receptionist'), createTask);

router.route('/:id')
  .get(getTask)
  .put(updateTask);

// Special routes
router.put('/:id/complete', completeTask);
router.put('/:id/assign', authorize('admin', 'manager'), assignTask);

module.exports = router;