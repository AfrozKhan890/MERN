// backend/controllers/guestController.js
const Guest = require('../models/Guest');
const Reservation = require('../models/Reservation');

// @desc    Get all guests with filtering
// @route   GET /api/guests
// @access  Private
const getGuests = async (req, res) => {
  try {
    const { 
      status, 
      vipStatus, 
      search, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    const filter = {};

    // Filter by status
    if (status) filter.status = status;
    
    // Filter by VIP status
    if (vipStatus !== undefined) filter.vipStatus = vipStatus === 'true';

    // Search by name, email, or phone
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const guests = await Guest.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('stayHistory', 'checkIn checkOut status room')
      .populate('createdBy', 'name');

    const total = await Guest.countDocuments(filter);

    // Get guest statistics
    const stats = {
      total: await Guest.countDocuments(),
      active: await Guest.countDocuments({ status: 'Active' }),
      vip: await Guest.countDocuments({ vipStatus: true }),
      blacklisted: await Guest.countDocuments({ status: 'Blacklisted' }),
      newThisMonth: await Guest.countDocuments({
        createdAt: {
          $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        }
      })
    };

    res.json({
      success: true,
      count: guests.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      stats,
      guests
    });
  } catch (error) {
    console.error('Get Guests Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get single guest
// @route   GET /api/guests/:id
// @access  Private
const getGuest = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id)
      .populate('stayHistory', 'checkIn checkOut status room totalAmount')
      .populate('createdBy', 'name email');

    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }

    // Get recent reservations for this guest
    const recentReservations = await Reservation.find({ guest: guest._id })
      .populate('room', 'roomNumber type price')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      guest,
      recentReservations
    });
  } catch (error) {
    console.error('Get Guest Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create guest
// @route   POST /api/guests
// @access  Private
const createGuest = async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      phone, 
      address,
      identification,
      preferences,
      notes,
      vipStatus
    } = req.body;

    // Check if guest already exists
    const existingGuest = await Guest.findOne({ 
      $or: [{ email: email?.toLowerCase() }, { phone }] 
    });

    if (existingGuest) {
      return res.status(400).json({ 
        success: false, 
        message: 'Guest already exists with this email or phone number' 
      });
    }

    const guest = await Guest.create({
      firstName,
      lastName,
      email,
      phone,
      address,
      identification,
      preferences,
      notes,
      vipStatus: vipStatus || false,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Guest created successfully',
      guest
    });
  } catch (error) {
    console.error('Create Guest Error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        message: 'Guest with this email already exists' 
      });
    }
    
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update guest
// @route   PUT /api/guests/:id
// @access  Private
const updateGuest = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);

    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }

    const updateFields = [
      'firstName', 'lastName', 'email', 'phone', 
      'address', 'identification', 'preferences', 
      'notes', 'vipStatus', 'status'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        guest[field] = req.body[field];
      }
    });

    const updatedGuest = await guest.save();

    res.json({
      success: true,
      message: 'Guest updated successfully',
      guest: updatedGuest
    });
  } catch (error) {
    console.error('Update Guest Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete guest (soft delete - mark as inactive)
// @route   DELETE /api/guests/:id
// @access  Private/Admin
const deleteGuest = async (req, res) => {
  try {
    const guest = await Guest.findById(req.params.id);

    if (!guest) {
      return res.status(404).json({ success: false, message: 'Guest not found' });
    }

    // Soft delete - set status to Inactive
    guest.status = 'Inactive';
    await guest.save();

    res.json({
      success: true,
      message: 'Guest deactivated successfully'
    });
  } catch (error) {
    console.error('Delete Guest Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get guest statistics
// @route   GET /api/guests/stats
// @access  Private
const getGuestStats = async (req, res) => {
  try {
    const totalGuests = await Guest.countDocuments();
    const activeGuests = await Guest.countDocuments({ status: 'Active' });
    const vipGuests = await Guest.countDocuments({ vipStatus: true });
    const newThisMonth = await Guest.countDocuments({
      createdAt: {
        $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      }
    });

    // Top frequent guests
    const topGuests = await Guest.find({ totalStays: { $gt: 0 } })
      .sort({ totalStays: -1 })
      .limit(5)
      .select('firstName lastName email totalStays vipStatus');

    // Guest by country (if address exists)
    const guestByCountry = await Guest.aggregate([
      { $match: { 'address.country': { $exists: true } } },
      { $group: { _id: '$address.country', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      stats: {
        totalGuests,
        activeGuests,
        vipGuests,
        newThisMonth
      },
      topGuests,
      guestByCountry
    });
  } catch (error) {
    console.error('Get Guest Stats Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Search guests
// @route   GET /api/guests/search
// @access  Private
const searchGuests = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ success: false, message: 'Search query is required' });
    }

    const guests = await Guest.find({
      $or: [
        { firstName: { $regex: query, $options: 'i' } },
        { lastName: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { phone: { $regex: query, $options: 'i' } }
      ]
    }).limit(20).select('firstName lastName email phone vipStatus totalStays');

    res.json({
      success: true,
      count: guests.length,
      guests
    });
  } catch (error) {
    console.error('Search Guests Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getGuests,
  getGuest,
  createGuest,
  updateGuest,
  deleteGuest,
  getGuestStats,
  searchGuests
};