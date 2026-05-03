// backend/controllers/reservationController.js (COMPLETE REPLACEMENT)
const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const Guest = require('../models/Guest');
const Invoice = require('../models/Invoice');
const User = require('../models/User');

// @desc    Create reservation
// @route   POST /api/reservations
// @access  Private
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

    // Check if room exists and is available
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    if (room.status !== 'Available') {
      return res.status(400).json({ message: 'Room is not available' });
    }

    // Find or create guest
    let guest;
    if (guestId) {
      guest = await Guest.findById(guestId);
      if (!guest) {
        return res.status(404).json({ message: 'Guest not found' });
      }
    } else if (guestInfo) {
      // Check if guest already exists
      guest = await Guest.findOne({ 
        $or: [
          { email: guestInfo.email?.toLowerCase() },
          { phone: guestInfo.phone }
        ]
      });

      if (!guest) {
        // Create new guest
        guest = await Guest.create({
          firstName: guestInfo.firstName || guestInfo.name?.split(' ')[0],
          lastName: guestInfo.lastName || guestInfo.name?.split(' ').slice(1).join(' ') || '',
          email: guestInfo.email,
          phone: guestInfo.phone,
          createdBy: req.user._id
        });
      }
    } else {
      return res.status(400).json({ message: 'Guest information is required' });
    }

    // Calculate total amount
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    
    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ message: 'Check-out date must be after check-in date' });
    }

    const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    const roomCharges = room.price * nights;
    const taxRate = 0.15;
    const taxAmount = roomCharges * taxRate;
    const totalAmount = roomCharges + taxAmount;

    // Create reservation
    const reservation = await Reservation.create({
      guest: guest._id,
      guestName: `${guest.firstName} ${guest.lastName}`,
      email: guest.email,
      phone: guest.phone,
      room: roomId,
      roomNumber: room.roomNumber,
      checkIn,
      checkOut,
      adults: adults || 1,
      children: children || 0,
      totalAmount,
      paymentMethod: paymentMethod || 'Cash',
      paymentStatus: advancePayment ? 'Partially Paid' : 'Pending',
      specialRequests,
      createdBy: req.user._id,
      status: 'Confirmed'
    });

    // Update room status
    room.status = 'Reserved';
    await room.save();

    // Update guest stay count
    guest.totalStays = (guest.totalStays || 0) + 1;
    guest.stayHistory.push(reservation._id);
    await guest.save();

    // If advance payment, create invoice entry
    if (advancePayment && advancePayment > 0) {
      await Invoice.create({
        reservation: reservation._id,
        guest: guest._id,
        roomCharges,
        additionalChargesTotal: 0,
        taxRate: 15,
        taxAmount,
        totalAmount,
        paidAmount: advancePayment,
        balance: totalAmount - advancePayment,
        status: 'Partially Paid',
        issuedDate: new Date(),
        notes: 'Advance payment received'
      });
    }

    const populatedReservation = await Reservation.findById(reservation._id)
      .populate('room', 'roomNumber type price floor')
      .populate('guest', 'firstName lastName email phone')
      .populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      reservation: populatedReservation
    });
  } catch (error) {
    console.error('Create Reservation Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all reservations
// @route   GET /api/reservations
// @access  Private
const getReservations = async (req, res) => {
  try {
    const { 
      status, 
      paymentStatus,
      fromDate, 
      toDate, 
      search,
      roomNumber,
      page = 1, 
      limit = 20 
    } = req.query;
    
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

    // Get statistics
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
      todayArrivals: await Reservation.countDocuments({
        checkIn: { $gte: today, $lt: tomorrow }
      }),
      todayDepartures: await Reservation.countDocuments({
        checkOut: { $gte: today, $lt: tomorrow }
      })
    };

    res.json({
      success: true,
      count: reservations.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      stats,
      reservations
    });
  } catch (error) {
    console.error('Get Reservations Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single reservation
// @route   GET /api/reservations/:id
// @access  Private
const getReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('room', 'roomNumber type price floor')
      .populate('guest', 'firstName lastName email phone')
      .populate('createdBy', 'name email');

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Get related invoice if exists
    const invoice = await Invoice.findOne({ reservation: reservation._id });

    res.json({ 
      success: true, 
      reservation,
      invoice 
    });
  } catch (error) {
    console.error('Get Reservation Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update reservation
// @route   PUT /api/reservations/:id
// @access  Private
const updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    const updateFields = [
      'checkIn', 'checkOut', 'adults', 'children',
      'specialRequests', 'status', 'paymentStatus', 'paymentMethod'
    ];

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        reservation[field] = req.body[field];
      }
    });

    // Recalculate total if dates changed
    if (req.body.checkIn || req.body.checkOut) {
      const room = await Room.findById(reservation.room);
      const checkInDate = new Date(reservation.checkIn);
      const checkOutDate = new Date(reservation.checkOut);
      
      if (checkOutDate <= checkInDate) {
        return res.status(400).json({ message: 'Check-out date must be after check-in date' });
      }

      const nights = Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
      reservation.totalAmount = room.price * nights;
    }

    await reservation.save();

    const updatedReservation = await Reservation.findById(reservation._id)
      .populate(['room', 'guest', 'createdBy']);

    res.json({
      success: true,
      reservation: updatedReservation
    });
  } catch (error) {
    console.error('Update Reservation Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete reservation
// @route   DELETE /api/reservations/:id
// @access  Private/Admin/Manager
const deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    // Update room status back to available
    await Room.findByIdAndUpdate(reservation.room, { status: 'Available' });
    
    // Soft delete - mark as cancelled
    reservation.status = 'Cancelled';
    await reservation.save();

    res.json({ success: true, message: 'Reservation cancelled successfully' });
  } catch (error) {
    console.error('Delete Reservation Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Check-in guest
// @route   PUT /api/reservations/:id/checkin
// @access  Private
const checkIn = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (!['Confirmed', 'Pending'].includes(reservation.status)) {
      return res.status(400).json({ 
        message: 'Reservation must be Confirmed or Pending before check-in' 
      });
    }

    reservation.status = 'Checked In';
    reservation.checkIn = new Date(); // Actual check-in time
    await reservation.save();

    // Update room status to Occupied
    await Room.findByIdAndUpdate(reservation.room, { 
      status: 'Occupied',
      $set: { lastOccupied: new Date() }
    });

    const updatedReservation = await Reservation.findById(reservation._id)
      .populate(['room', 'guest', 'createdBy']);

    res.json({
      success: true,
      message: 'Guest checked in successfully',
      reservation: updatedReservation
    });
  } catch (error) {
    console.error('Check-in Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Check-out guest with billing
// @route   PUT /api/reservations/:id/checkout
// @access  Private
const checkOut = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({ message: 'Reservation not found' });
    }

    if (reservation.status !== 'Checked In') {
      return res.status(400).json({ message: 'Guest must be checked in before check-out' });
    }

    const { additionalCharges = 0, additionalServices = [], paymentMethod } = req.body;

    // Calculate final bill
    const room = await Room.findById(reservation.room);
    const checkInTime = new Date(reservation.checkIn);
    const checkOutTime = new Date();
    const nights = Math.ceil((checkOutTime - checkInTime) / (1000 * 60 * 60 * 24)) || 1;
    const roomCharges = room.price * nights;
    const taxRate = 0.15;
    const subtotal = roomCharges + parseFloat(additionalCharges);
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    // Update reservation
    reservation.status = 'Checked Out';
    reservation.checkOut = checkOutTime;
    reservation.totalAmount = totalAmount;
    await reservation.save();

    // Create or update invoice
    let invoice = await Invoice.findOne({ reservation: reservation._id });
    
    if (invoice) {
      invoice.roomCharges = roomCharges;
      invoice.additionalChargesTotal = parseFloat(additionalCharges);
      invoice.taxAmount = taxAmount;
      invoice.totalAmount = totalAmount;
      invoice.balance = totalAmount - invoice.paidAmount;
      invoice.status = invoice.balance <= 0 ? 'Paid' : 'Partially Paid';
      if (additionalServices.length > 0) {
        invoice.additionalServices = additionalServices;
      }
      if (paymentMethod) invoice.paymentHistory.push({
        amount: totalAmount - invoice.paidAmount,
        method: paymentMethod,
        date: new Date(),
        reference: `Check-out payment`
      });
      invoice.paidAmount = totalAmount;
      invoice.balance = 0;
      invoice.status = 'Paid';
      await invoice.save();
    } else {
      invoice = await Invoice.create({
        reservation: reservation._id,
        guest: reservation.guest,
        roomCharges,
        additionalServices,
        additionalChargesTotal: parseFloat(additionalCharges),
        taxRate: 15,
        taxAmount,
        totalAmount,
        paidAmount: totalAmount,
        balance: 0,
        status: 'Paid',
        issuedDate: new Date(),
        dueDate: new Date(),
        paymentHistory: [{
          amount: totalAmount,
          method: paymentMethod || 'Cash',
          date: new Date(),
          reference: 'Check-out payment'
        }]
      });
    }

    // Update room status to Cleaning
    await Room.findByIdAndUpdate(reservation.room, { 
      status: 'Cleaning' 
    });

    const updatedReservation = await Reservation.findById(reservation._id)
      .populate(['room', 'guest', 'createdBy']);

    res.json({
      success: true,
      message: 'Guest checked out successfully',
      reservation: updatedReservation,
      invoice
    });
  } catch (error) {
    console.error('Check-out Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get today's arrivals and departures
// @route   GET /api/reservations/today
// @access  Private
const getTodayReservations = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const arrivals = await Reservation.find({
      checkIn: { $gte: today, $lt: tomorrow }
    }).populate('room', 'roomNumber type').populate('guest', 'firstName lastName phone');

    const departures = await Reservation.find({
      checkOut: { $gte: today, $lt: tomorrow },
      status: 'Checked In'
    }).populate('room', 'roomNumber type').populate('guest', 'firstName lastName phone');

    const currentlyCheckedIn = await Reservation.find({
      status: 'Checked In'
    }).populate('room', 'roomNumber type').populate('guest', 'firstName lastName');

    res.json({
      success: true,
      today: {
        arrivals,
        departures,
        checkedIn: currentlyCheckedIn,
        arrivalsCount: arrivals.length,
        departuresCount: departures.length,
        checkedInCount: currentlyCheckedIn.length
      }
    });
  } catch (error) {
    console.error('Get Today Reservations Error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
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