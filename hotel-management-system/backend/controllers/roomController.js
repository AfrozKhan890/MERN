// backend/controllers/roomController.js - COMPLETE CORRECTED
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');  // ← IMPORTANT: Add this line

// @desc    Get all rooms
const getRooms = async (req, res) => {
  try {
    const { 
      status, 
      type, 
      floor, 
      minPrice, 
      maxPrice, 
      capacity,
      search,
      page = 1,
      limit = 10
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (type) filter.type = type;
    if (floor) filter.floor = floor;
    if (capacity) filter.capacity = { $gte: parseInt(capacity) };
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }
    if (search) {
      filter.$or = [
        { roomNumber: { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const rooms = await Room.find(filter)
      .sort({ roomNumber: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Room.countDocuments(filter);

    res.json({
      success: true,
      count: rooms.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      rooms
    });
  } catch (error) {
    console.error('Get Rooms Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get single room
const getRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.json({ success: true, room });
  } catch (error) {
    console.error('Get Room Error:', error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Room not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create room
const createRoom = async (req, res) => {
  try {
    const { roomNumber, floor, type, price, capacity, status, description, amenities } = req.body;

    const roomExists = await Room.findOne({ roomNumber });
    if (roomExists) {
      return res.status(400).json({ message: 'Room number already exists' });
    }

    const room = await Room.create({
      roomNumber,
      floor,
      type,
      price,
      capacity,
      status: status || 'Available',
      description,
      amenities: amenities || []
    });

    res.status(201).json({ success: true, room });
  } catch (error) {
    console.error('Create Room Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update room
const updateRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const updateFields = req.body;
    Object.keys(updateFields).forEach(key => {
      room[key] = updateFields[key];
    });

    const updatedRoom = await room.save();
    res.json({ success: true, room: updatedRoom });
  } catch (error) {
    console.error('Update Room Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete room
const deleteRoom = async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.isActive = false;
    await room.save();

    res.json({ success: true, message: 'Room deactivated successfully' });
  } catch (error) {
    console.error('Delete Room Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update room status
const updateRoomStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['Available', 'Occupied', 'Reserved', 'Cleaning', 'Maintenance'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    room.status = status;
    await room.save();

    res.json({ success: true, room });
  } catch (error) {
    console.error('Update Room Status Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get room statistics
const getRoomStats = async (req, res) => {
  try {
    const stats = await Room.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'Available' });
    const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });

    res.json({
      success: true,
      totalRooms,
      availableRooms,
      occupiedRooms,
      occupancyRate: ((occupiedRooms / totalRooms) * 100).toFixed(2),
      stats
    });
  } catch (error) {
    console.error('Get Room Stats Error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Sync room status from hotels to rooms collection
const syncRoomStatus = async (req, res) => {
  try {
    const Hotel = require('../models/Hotel'); // Alternative: use this if you don't want to add at top
    const hotels = await Hotel.find({});
    let updated = 0;
    
    for (const hotel of hotels) {
      for (const embeddedRoom of hotel.rooms) {
        await Room.findOneAndUpdate(
          { roomNumber: embeddedRoom.roomNumber },
          { status: embeddedRoom.status },
          { upsert: true }
        );
        updated++;
      }
    }
    
    res.json({ success: true, message: `Synced ${updated} rooms` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getRooms,
  getRoom,
  createRoom,
  updateRoom,
  deleteRoom,
  updateRoomStatus,
  getRoomStats,
  syncRoomStatus
};