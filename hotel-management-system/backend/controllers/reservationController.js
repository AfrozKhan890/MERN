// backend/controllers/reservationController.js - COMPLETE FIXED (WITH AUTO INVOICE)
const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const Hotel = require('../models/Hotel');
const Guest = require('../models/Guest');
const Invoice = require('../models/Invoice');
const User = require('../models/User');

const emitRealtime = (req, event, payload) => {
  const io = req.app.get('io');
  if (io) {
    io.to('admins').emit(event, payload);
    io.emit(event, payload);
  }
};

// Helper function to find room in hotels collection
const findRoomById = async (roomId) => {
  // First try to find in rooms collection
  let room = await Room.findById(roomId).lean();
  if (room) return { room, source: 'rooms' };
  
  // If not found, search in hotels' embedded rooms
  const hotel = await Hotel.findOne({ "rooms._id": roomId });
  if (hotel) {
    const embeddedRoom = hotel.rooms.find(r => r._id.toString() === roomId.toString());
    if (embeddedRoom) {
      return { 
        room: {
          _id: embeddedRoom._id,
          roomNumber: embeddedRoom.roomNumber,
          type: embeddedRoom.type,
          price: embeddedRoom.price,
          capacity: embeddedRoom.capacity,
          status: embeddedRoom.status,
          hotelId: hotel._id,
          hotelName: hotel.name
        }, 
        source: 'embedded',
        hotel 
      };
    }
  }
  return null;
};

// @desc    Get all reservations
const getReservations = async (req, res) => {
  try {
    const { status, paymentStatus, fromDate, toDate, search, roomNumber, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (roomNumber) filter.roomNumber = { $regex: roomNumber, $options: 'i' };
    
    if (fromDate || toDate) {
      filter.checkIn = {};
      if (fromDate) filter.checkIn.$gte = new Date(fromDate);
      if (toDate) filter.checkIn.$lte = new Date(toDate);
    }
    
    if (search) {
      filter.$or = [
        { guestName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { roomNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reservations = await Reservation.find(filter)
      .populate('room', 'roomNumber type price')
      .populate('guest', 'firstName lastName email phone')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Reservation.countDocuments(filter);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const stats = {
      total,
      confirmed: await Reservation.countDocuments({ ...filter, status: 'Confirmed' }),
      checkedIn: await Reservation.countDocuments({ ...filter, status: 'Checked In' }),
      checkedOut: await Reservation.countDocuments({ ...filter, status: 'Checked Out' }),
      pending: await Reservation.countDocuments({ ...filter, status: 'Pending' }),
      cancelled: await Reservation.countDocuments({ ...filter, status: 'Cancelled' }),
      todayArrivals: await Reservation.countDocuments({ checkIn: { $gte: today, $lt: tomorrow } }),
      todayDepartures: await Reservation.countDocuments({ checkOut: { $gte: today, $lt: tomorrow } })
    };

    res.json({ success: true, count: reservations.length, total, totalPages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page), stats, reservations });
  } catch (error) {
    console.error('Get Reservations Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get single reservation
const getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('room', 'roomNumber type price floor')
      .populate('guest', 'firstName lastName email phone')
      .populate('createdBy', 'name email');

    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });

    const invoice = await Invoice.findOne({ reservation: reservation._id });
    res.json({ success: true, reservation, invoice });
  } catch (error) {
    console.error('Get Reservation Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update reservation
const updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });

    const updateFields = ['checkIn', 'checkOut', 'adults', 'children', 'specialRequests', 'status', 'paymentStatus', 'paymentMethod'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) reservation[field] = req.body[field];
    });

    if (req.body.checkIn || req.body.checkOut) {
      const room = await Room.findById(reservation.room);
      if (room) {
        const nights = Math.ceil((new Date(reservation.checkOut) - new Date(reservation.checkIn)) / (1000 * 60 * 60 * 24));
        reservation.totalAmount = room.price * nights;
      }
    }

    await reservation.save();
    const updatedReservation = await Reservation.findById(reservation._id).populate('room', 'roomNumber type price').populate('guest', 'firstName lastName email');
    res.json({ success: true, reservation: updatedReservation });
  } catch (error) {
    console.error('Update Reservation Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Delete/Cancel reservation
const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });

    if (reservation.status === 'Confirmed' || reservation.status === 'Pending') {
      await Room.findByIdAndUpdate(reservation.room, { status: 'Available' });
      await Hotel.findOneAndUpdate({ "rooms._id": reservation.room }, { $set: { "rooms.$.status": "Available" } });
    }
    
    reservation.status = 'Cancelled';
    await reservation.save();
    res.json({ success: true, message: 'Reservation cancelled successfully' });
  } catch (error) {
    console.error('Delete Reservation Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Check-in guest
const checkIn = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });

    if (!['Confirmed', 'Pending'].includes(reservation.status)) {
      return res.status(400).json({ success: false, message: 'Reservation must be Confirmed or Pending before check-in' });
    }

    reservation.status = 'Checked In';
    await reservation.save();

    await Hotel.findOneAndUpdate({ "rooms._id": reservation.room }, { $set: { "rooms.$.status": "Occupied" } });
    await Room.findByIdAndUpdate(reservation.room, { status: 'Occupied' });

    const updatedReservation = await Reservation.findById(reservation._id).populate('room', 'roomNumber type').populate('guest', 'firstName lastName');
    emitRealtime(req, 'reservation-updated', {
      type: 'checked-in',
      reservationId: updatedReservation._id,
      roomNumber: updatedReservation.room?.roomNumber,
      status: updatedReservation.status
    });
    res.json({ success: true, message: 'Guest checked in successfully', reservation: updatedReservation });
  } catch (error) {
    console.error('Check-in Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create reservation with AUTO INVOICE
const createReservation = async (req, res) => {
  try {
    const { 
      roomId, 
      guestId,
      guestInfo,
      checkIn, 
      checkOut, 
      adults, 
      children,
      paymentMethod,
      specialRequests,
      advancePayment
    } = req.body;

    console.log('Create reservation request:', { roomId, guestInfo, checkIn, checkOut });

    // FIND ROOM
    const roomData = await findRoomById(roomId);
    if (!roomData) {
      console.error('Room NOT found for ID:', roomId);
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const room = roomData.room;
    console.log('Room found:', room);

    if (room.status !== 'Available') {
      return res.status(400).json({ success: false, message: 'Room is not available' });
    }

    // FIND OR CREATE GUEST
    let guest;
    if (guestId) {
      guest = await Guest.findById(guestId);
    } else if (guestInfo) {
      guest = await Guest.findOne({ email: guestInfo.email?.toLowerCase() });
      
      if (!guest) {
        let firstName = 'Guest';
        let lastName = 'User';
        
        if (guestInfo.name) {
          const nameParts = guestInfo.name.trim().split(' ');
          firstName = nameParts[0];
          lastName = nameParts.slice(1).join(' ') || 'User';
        }
        
        guest = await Guest.create({
          firstName: firstName,
          lastName: lastName,
          email: guestInfo.email?.toLowerCase(),
          phone: guestInfo.phone || 'N/A',
          createdBy: req.user?._id || null
        });
        console.log('New guest created:', guest._id);
      }
    }

    if (!guest) {
      return res.status(400).json({ success: false, message: 'Guest information is required' });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ success: false, message: 'Check-out date must be after check-in date' });
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const roomCharges = room.price * nights;
    const taxRate = 0.15;
    const taxAmount = roomCharges * taxRate;
    const totalAmount = roomCharges + taxAmount;

    // CREATE RESERVATION
    const reservation = await Reservation.create({
      guest: guest._id,
      guestName: `${guest.firstName} ${guest.lastName}`,
      email: guest.email,
      phone: guest.phone,
      room: roomId,
      roomNumber: room.roomNumber,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      adults: adults || 1,
      children: children || 0,
      totalAmount,
      paymentMethod: paymentMethod || 'Cash',
      paymentStatus: advancePayment ? 'Partially Paid' : 'Pending',
      specialRequests: specialRequests || '',
      createdBy: req.user?._id || null,
      status: 'Confirmed'
    });

    console.log('Reservation created:', reservation._id);

    // UPDATE ROOM STATUS
    if (roomData.source === 'embedded' && roomData.hotel) {
      await Hotel.findOneAndUpdate({ "rooms._id": roomId }, { $set: { "rooms.$.status": "Reserved" } });
    }
    await Room.findByIdAndUpdate(roomId, { status: 'Reserved' });

    // UPDATE GUEST STAYS
    guest.totalStays = (guest.totalStays || 0) + 1;
    guest.stayHistory.push(reservation._id);
    await guest.save();

    // ========== FIX: CREATE INVOICE AUTOMATICALLY ==========
    const invoice = await Invoice.create({
      reservation: reservation._id,
      guest: guest._id,
      roomCharges: roomCharges,
      additionalServices: [],
      additionalChargesTotal: 0,
      taxRate: 15,
      taxAmount: taxAmount,
      totalAmount: totalAmount,
      paidAmount: advancePayment || 0,
      balance: totalAmount - (advancePayment || 0),
      status: advancePayment ? 'Partially Paid' : 'Issued',
      issuedDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      paymentHistory: advancePayment ? [{
        amount: advancePayment,
        method: paymentMethod || 'Credit Card',
        date: new Date(),
        reference: 'Advance payment'
      }] : []
    });

    console.log('Invoice created:', invoice.invoiceNumber);

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('guest', 'firstName lastName email phone')
      .populate('createdBy', 'name');

    emitRealtime(req, 'reservation-updated', {
      type: 'created',
      reservationId: populatedReservation._id,
      roomNumber: populatedReservation.roomNumber,
      status: populatedReservation.status
    });

    res.status(201).json({
      success: true,
      message: 'Reservation created successfully',
      reservation: populatedReservation,
      invoice: invoice
    });
  } catch (error) {
    console.error('Create Reservation Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Check-out guest with billing
const checkOut = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });

    if (reservation.status !== 'Checked In') {
      return res.status(400).json({ success: false, message: 'Guest must be checked in before check-out' });
    }

    const { additionalCharges = 0, additionalServices = [], paymentMethod = 'Cash' } = req.body;

    let roomPrice = 0;
    const roomDoc = await Room.findById(reservation.room);
    if (roomDoc) roomPrice = roomDoc.price;

    const nights = Math.max(1, Math.ceil((new Date() - new Date(reservation.checkIn)) / (1000 * 60 * 60 * 24)));
    const roomCharges = roomPrice * nights;
    const subtotal = roomCharges + parseFloat(additionalCharges);
    const taxAmount = subtotal * 0.15;
    const totalAmount = subtotal + taxAmount;

    reservation.status = 'Checked Out';
    reservation.checkOut = new Date();
    reservation.totalAmount = totalAmount;
    await reservation.save();

    await Hotel.findOneAndUpdate({ "rooms._id": reservation.room }, { $set: { "rooms.$.status": "Available" } });
    await Room.findByIdAndUpdate(reservation.room, { status: 'Available' });

    let invoice = await Invoice.findOne({ reservation: reservation._id });
    
    if (invoice) {
      invoice.roomCharges = roomCharges;
      invoice.additionalChargesTotal = parseFloat(additionalCharges);
      invoice.taxAmount = taxAmount;
      invoice.totalAmount = totalAmount;
      invoice.paidAmount = totalAmount;
      invoice.balance = 0;
      invoice.status = 'Paid';
      invoice.paymentHistory.push({ amount: totalAmount - (invoice.paidAmount || 0), method: paymentMethod, date: new Date(), reference: 'Check-out payment' });
      await invoice.save();
    } else {
      invoice = await Invoice.create({
        reservation: reservation._id,
        guest: reservation.guest,
        roomCharges,
        additionalServices: additionalServices || [],
        additionalChargesTotal: parseFloat(additionalCharges),
        taxRate: 15,
        taxAmount,
        totalAmount,
        paidAmount: totalAmount,
        balance: 0,
        status: 'Paid',
        issuedDate: new Date(),
        dueDate: new Date(),
        paymentHistory: [{ amount: totalAmount, method: paymentMethod, date: new Date(), reference: 'Check-out payment' }]
      });
    }

    const updatedReservation = await Reservation.findById(reservation._id).populate('room', 'roomNumber type').populate('guest', 'firstName lastName');
    emitRealtime(req, 'reservation-updated', {
      type: 'checked-out',
      reservationId: updatedReservation._id,
      roomNumber: updatedReservation.room?.roomNumber,
      status: updatedReservation.status
    });
    res.json({ success: true, message: 'Guest checked out successfully', reservation: updatedReservation, invoice });
  } catch (error) {
    console.error('Check-out Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get today's reservations
const getTodayReservations = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const arrivals = await Reservation.find({ checkIn: { $gte: today, $lt: tomorrow } }).populate('room', 'roomNumber type').populate('guest', 'firstName lastName phone');
    const departures = await Reservation.find({ checkOut: { $gte: today, $lt: tomorrow }, status: 'Checked In' }).populate('room', 'roomNumber type').populate('guest', 'firstName lastName phone');
    const currentlyCheckedIn = await Reservation.find({ status: 'Checked In' }).populate('room', 'roomNumber type').populate('guest', 'firstName lastName');

    res.json({ success: true, today: { arrivals, departures, checkedIn: currentlyCheckedIn, arrivalsCount: arrivals.length, departuresCount: departures.length, checkedInCount: currentlyCheckedIn.length } });
  } catch (error) {
    console.error('Get Today Reservations Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createReservation,
  getReservations,
  getReservation,
  updateReservation,
  deleteReservation,
  checkIn,
  checkOut,
  getTodayReservations
};