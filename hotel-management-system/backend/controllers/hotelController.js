// backend/controllers/hotelController.js (CREATE THIS FILE)
const Hotel = require('../models/Hotel');
const Reservation = require('../models/Reservation');
const User = require('../models/User');

// @desc    Get all hotels (public gallery)
// @route   GET /api/hotels
// @access  Public
const getHotels = async (req, res) => {
  try {
    const { location, minRating, search } = req.query;
    const filter = { isActive: true };

    if (location) filter.location = { $regex: location, $options: 'i' };
    if (minRating) filter.rating = { $gte: parseFloat(minRating) };
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const hotels = await Hotel.find(filter)
      .populate('createdBy', 'name')
      .sort({ rating: -1, createdAt: -1 });

    res.json({
      success: true,
      count: hotels.length,
      hotels
    });
  } catch (error) {
    console.error('Get Hotels Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single hotel details
// @route   GET /api/hotels/:id
// @access  Public
const getHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    res.json({ success: true, hotel });
  } catch (error) {
    console.error('Get Hotel Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create hotel (Admin/Manager)
// @route   POST /api/hotels
// @access  Private/Admin/Manager
const createHotel = async (req, res) => {
  try {
    const { 
      name, location, description, images, rating, 
      amenities, rooms, contactPhone, contactEmail 
    } = req.body;

    // Validate required fields
    if (!name || !location || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, location, and description are required' 
      });
    }

    const hotel = await Hotel.create({
      name,
      location,
      description,
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'],
      rating: rating || 4.5,
      amenities: amenities || ['Free WiFi', 'Restaurant', 'Room Service'],
      rooms: rooms || [
        { roomNumber: '101', type: 'Standard', price: 150, capacity: 2, status: 'Available' }
      ],
      contactPhone: contactPhone || '',
      contactEmail: contactEmail || '',
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Hotel created successfully',
      hotel
    });
  } catch (error) {
    console.error('Create Hotel Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update hotel
// @route   PUT /api/hotels/:id
// @access  Private/Admin/Manager
const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Update all fields from request body
    const updateFields = [
      'name', 'location', 'description', 'images', 'rating',
      'amenities', 'rooms', 'contactPhone', 'contactEmail', 'isActive'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        hotel[field] = req.body[field];
      }
    });

    const updatedHotel = await hotel.save();

    res.json({
      success: true,
      message: 'Hotel updated successfully',
      hotel: updatedHotel
    });
  } catch (error) {
    console.error('Update Hotel Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete hotel (soft delete)
// @route   DELETE /api/hotels/:id
// @access  Private/Admin
const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Soft delete - mark as inactive
    hotel.isActive = false;
    await hotel.save();

    res.json({ success: true, message: 'Hotel removed from gallery' });
  } catch (error) {
    console.error('Delete Hotel Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get hotel statistics for dashboard
// @route   GET /api/hotels/stats
// @access  Public
const getHotelStats = async (req, res) => {
  try {
    const totalHotels = await Hotel.countDocuments({ isActive: true });
    
    const roomStats = await Hotel.aggregate([
      { $unwind: '$rooms' },
      { $group: {
        _id: null,
        totalRooms: { $sum: 1 },
        availableRooms: { 
          $sum: { $cond: [{ $eq: ['$rooms.status', 'Available'] }, 1, 0] } 
        },
        occupiedRooms: { 
          $sum: { $cond: [{ $eq: ['$rooms.status', 'Occupied'] }, 1, 0] } 
        },
        reservedRooms: { 
          $sum: { $cond: [{ $eq: ['$rooms.status', 'Reserved'] }, 1, 0] } 
        }
      }}
    ]);

    // Get real guest counts
    const totalGuests = await User.countDocuments({ role: 'guest' });
    const activeGuests = await User.countDocuments({ role: 'guest', status: 'Active' });
    const newGuestsThisMonth = await User.countDocuments({
      role: 'guest',
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

    // Get recent bookings
    const recentBookings = await Reservation.find()
      .populate('guest', 'name email')
      .populate('room', 'roomNumber')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalHotels,
        totalRooms: roomStats[0]?.totalRooms || 0,
        availableRooms: roomStats[0]?.availableRooms || 0,
        occupiedRooms: roomStats[0]?.occupiedRooms || 0,
        reservedRooms: roomStats[0]?.reservedRooms || 0,
        totalGuests,
        activeGuests,
        newGuestsThisMonth
      },
      recentBookings
    });
  } catch (error) {
    console.error('Get Hotel Stats Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getHotels,
  getHotel,
  createHotel,
  updateHotel,
  deleteHotel,
  getHotelStats
};