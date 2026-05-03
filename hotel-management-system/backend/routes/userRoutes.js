// backend/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.route('/')
  .get(userController.getUsers)
  .post(userController.createUser);

router.route('/:id')
  .get(userController.getUser)
  .put(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;