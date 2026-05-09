// backend/controllers/hotelController.js - COMPLETE FIXED
const Hotel = require('../models/Hotel');
const Room = require('../models/Room');  // ← ADD THIS
const Reservation = require('../models/Reservation');
const User = require('../models/User');

const emitAdminEvent = (req, event, payload) => {
  const io = req.app.get('io');
  if (io) {
    io.to('admins').emit(event, payload);
    io.emit(event, payload);
  }
};

// @desc    Get all hotels (public gallery)
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

    const hotels = await Hotel.find(filter).populate('createdBy', 'name').sort({ rating: -1, createdAt: -1 });

    res.json({ success: true, count: hotels.length, hotels });
  } catch (error) {
    console.error('Get Hotels Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single hotel details
const getHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id).populate('createdBy', 'name email');
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }
    res.json({ success: true, hotel });
  } catch (error) {
    console.error('Get Hotel Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create hotel (Admin/Manager)
const createHotel = async (req, res) => {
  try {
    const { name, location, description, images, rating, amenities, rooms, contactPhone, contactEmail } = req.body;

    if (!name || !location || !description) {
      return res.status(400).json({ success: false, message: 'Name, location, and description are required' });
    }

    // ========== FIX: Create rooms in Room collection first ==========
    const createdRooms = [];
    const roomsToCreate = rooms && rooms.length > 0 ? rooms : [{ roomNumber: '101', type: 'Standard', price: 150, capacity: 2, status: 'Available' }];
    
    for (const roomData of roomsToCreate) {
      const existingRoom = await Room.findOne({ roomNumber: roomData.roomNumber });
      if (!existingRoom) {
        const newRoom = await Room.create({
          roomNumber: roomData.roomNumber,
          type: roomData.type,
          floor: '1st Floor',
          price: roomData.price,
          capacity: roomData.capacity,
          status: roomData.status || 'Available',
          amenities: ['WiFi', 'TV']
        });
        createdRooms.push({
          _id: newRoom._id,
          roomNumber: newRoom.roomNumber,
          type: newRoom.type,
          price: newRoom.price,
          capacity: newRoom.capacity,
          status: newRoom.status
        });
      } else {
        createdRooms.push({
          _id: existingRoom._id,
          roomNumber: existingRoom.roomNumber,
          type: existingRoom.type,
          price: existingRoom.price,
          capacity: existingRoom.capacity,
          status: existingRoom.status
        });
      }
    }

    const hotel = await Hotel.create({
      name,
      location,
      description,
      images: images && images.length > 0 ? images : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'],
      rating: rating || 4.5,
      amenities: amenities || ['Free WiFi', 'Restaurant', 'Room Service'],
      rooms: createdRooms,
      contactPhone: contactPhone || '',
      contactEmail: contactEmail || '',
      createdBy: req.user._id
    });

    emitAdminEvent(req, 'hotel-updated', {
      type: 'created',
      hotelId: hotel._id,
      name: hotel.name
    });

    res.status(201).json({ success: true, message: 'Hotel created successfully', hotel });
  } catch (error) {
    console.error('Create Hotel Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update hotel
const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const updateFields = ['name', 'location', 'description', 'images', 'rating', 'amenities', 'rooms', 'contactPhone', 'contactEmail', 'isActive'];

    // If rooms are being updated, sync with Room collection
    if (req.body.rooms && req.body.rooms.length > 0) {
      const updatedRooms = [];
      for (const roomData of req.body.rooms) {
        let existingRoom = await Room.findOne({ roomNumber: roomData.roomNumber });
        if (existingRoom) {
          existingRoom.type = roomData.type;
          existingRoom.price = roomData.price;
          existingRoom.capacity = roomData.capacity;
          existingRoom.status = roomData.status;
          await existingRoom.save();
          updatedRooms.push({
            _id: existingRoom._id,
            roomNumber: existingRoom.roomNumber,
            type: existingRoom.type,
            price: existingRoom.price,
            capacity: existingRoom.capacity,
            status: existingRoom.status
          });
        } else {
          const newRoom = await Room.create({
            roomNumber: roomData.roomNumber,
            type: roomData.type,
            floor: '1st Floor',
            price: roomData.price,
            capacity: roomData.capacity,
            status: roomData.status || 'Available',
            amenities: ['WiFi', 'TV']
          });
          updatedRooms.push({
            _id: newRoom._id,
            roomNumber: newRoom.roomNumber,
            type: newRoom.type,
            price: newRoom.price,
            capacity: newRoom.capacity,
            status: newRoom.status
          });
        }
      }
      req.body.rooms = updatedRooms;
    }

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        hotel[field] = req.body[field];
      }
    });

    const updatedHotel = await hotel.save();
    emitAdminEvent(req, 'hotel-updated', {
      type: 'updated',
      hotelId: updatedHotel._id,
      name: updatedHotel.name
    });
    res.json({ success: true, message: 'Hotel updated successfully', hotel: updatedHotel });
  } catch (error) {
    console.error('Update Hotel Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete hotel (soft delete)
const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    hotel.isActive = false;
    await hotel.save();

    emitAdminEvent(req, 'hotel-updated', {
      type: 'deleted',
      hotelId: hotel._id,
      name: hotel.name
    });

    res.json({ success: true, message: 'Hotel removed from gallery' });
  } catch (error) {
    console.error('Delete Hotel Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get hotel statistics for dashboard
const getHotelStats = async (req, res) => {
  try {
    const totalHotels = await Hotel.countDocuments({ isActive: true });
    
    const roomStats = await Hotel.aggregate([
      { $unwind: '$rooms' },
      { $group: {
        _id: null,
        totalRooms: { $sum: 1 },
        availableRooms: { $sum: { $cond: [{ $eq: ['$rooms.status', 'Available'] }, 1, 0] } },
        occupiedRooms: { $sum: { $cond: [{ $eq: ['$rooms.status', 'Occupied'] }, 1, 0] } },
        reservedRooms: { $sum: { $cond: [{ $eq: ['$rooms.status', 'Reserved'] }, 1, 0] } }
      }}
    ]);

    const totalGuests = await User.countDocuments({ role: 'guest' });
    const activeGuests = await User.countDocuments({ role: 'guest', status: 'Active' });
    const newGuestsThisMonth = await User.countDocuments({
      role: 'guest',
      createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
    });

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

module.exports = { getHotels, 
  getHotel, 
  createHotel, 
  updateHotel, 
  deleteHotel, 
  getHotelStats 
};
