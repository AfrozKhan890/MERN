// backend/controllers/authController.js - FIXED register function
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'default_secret', {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

// @desc    Register user (Guest registration - PUBLIC)
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, phone } = req.body;

    console.log('Register request:', { name, email, phone }); // Debug log

    // Check if user already exists
    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user as GUEST by default - NO role selection from registration
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: 'guest',
      phone: phone || '',
      department: 'guest',
      status: 'Active'
    });

    console.log('User created:', user._id, user.role); // Debug log

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful! Please login.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      },
      token
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// @desc    Login user - redirects based on role
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    console.log('Login request:', email); // Debug log

    // Find user and include password
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if user is active
    if (user.status !== 'Active') {
      return res.status(401).json({ message: 'Your account has been deactivated. Contact administrator.' });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Determine redirect URL based on role
    let redirectUrl = '/gallery';
    const role = user.role;
    
    console.log('User role:', role); // Debug log
    
    if (role === 'admin') {
      redirectUrl = '/dashboard/admin';
    } else if (role === 'manager') {
      redirectUrl = '/dashboard/manager';
    } else if (role === 'receptionist') {
      redirectUrl = '/dashboard/staff';
    } else if (role === 'housekeeping') {
      redirectUrl = '/dashboard/housekeeping';
    } else if (role === 'maintenance') {
      redirectUrl = '/dashboard/staff';
    } else {
      redirectUrl = '/gallery';
    }

    console.log('Redirect URL:', redirectUrl); // Debug log

    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        avatar: user.avatar
      },
      token,
      redirectUrl
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get Profile Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/updateprofile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const { name, email, phone, department } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.department = department || user.department;

    const updatedUser = await user.save();
    res.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Change password
// @route   PUT /api/auth/changepassword
// @access  Private
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id);
    res.json({ success: true, message: 'Password updated successfully', token });
  } catch (error) {
    console.error('Change Password Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/auth/users
// @access  Private/Admin
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ success: true, count: users.length, users });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user role (Admin only)
// @route   PUT /api/auth/users/:id/role
// @access  Private/Admin
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const validRoles = ['admin', 'manager', 'receptionist', 'housekeeping', 'maintenance', 'guest'];
    
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent changing the last admin account to non-admin
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot change the last admin account' });
      }
    }

    user.role = role;
    // Update department based on role
    if (role === 'guest') {
      user.department = 'guest';
    } else if (role === 'admin') {
      user.department = 'administration';
    } else if (role === 'manager') {
      user.department = 'management';
    } else if (role === 'receptionist') {
      user.department = 'frontdesk';
    } else if (role === 'housekeeping') {
      user.department = 'housekeeping';
    } else if (role === 'maintenance') {
      user.department = 'maintenance';
    }
    
    await user.save();

    res.json({ success: true, message: `User role updated to ${role}`, user });
  } catch (error) {
    console.error('Update Role Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update user status (Activate/Deactivate)
// @route   PUT /api/auth/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.status = status;
    await user.save();
    
    res.json({ success: true, message: `User status updated to ${status}`, user });
  } catch (error) {
    console.error('Update Status Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
// Add this to backend/controllers/authController.js

// @desc    Create staff user (Admin only)
// @route   POST /api/auth/create-staff
// @access  Private/Admin
const createStaff = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, department, phone } = req.body;

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role,
      department,
      phone: phone || '',
      status: 'Active'
    });

    res.status(201).json({
      success: true,
      message: `${role} account created successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department
      }
    });
  } catch (error) {
    console.error('Create Staff Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add createStaff to module.exports
module.exports = {
  register,
  login,
  createStaff,  // ADD THIS
  getMe,
  updateProfile,
  changePassword,
  getAllUsers,
  updateUserRole,
  updateUserStatus
};
