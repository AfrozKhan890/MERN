// backend/routes/authRoutes.js - FIXED
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Validation for PUBLIC registration (no department required)
const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

// Validation for ADMIN creating staff
const staffRegisterValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').notEmpty().withMessage('Role is required'),
  body('department').trim().notEmpty().withMessage('Department is required')
];

const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
];

// PUBLIC routes
router.post('/register', registerValidation, authController.register);  // Guest registration
router.post('/login', loginValidation, authController.login);

// ADMIN routes (for creating staff)
router.post('/create-staff', protect, authorize('admin'), staffRegisterValidation, authController.createStaff);

// Private routes
router.get('/me', protect, authController.getMe);
router.put('/updateprofile', protect, authController.updateProfile);
router.put('/changepassword', protect, authController.changePassword);

// Admin routes
router.get('/users', protect, authorize('admin'), authController.getAllUsers);
router.put('/users/:id/role', protect, authorize('admin'), authController.updateUserRole);
router.put('/users/:id/status', protect, authorize('admin'), authController.updateUserStatus);

module.exports = router;