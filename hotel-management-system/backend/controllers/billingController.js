// backend/controllers/billingController.js - ENHANCED WITH COMPREHENSIVE FINANCIAL FEATURES
const Invoice = require('../models/Invoice');
const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const Guest = require('../models/Guest');
const mongoose = require('mongoose');

// @desc    Get all invoices
const getInvoices = async (req, res) => {
  try {
    const { status, fromDate, toDate, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (status) filter.status = status;
    
    if (fromDate || toDate) {
      filter.issuedDate = {};
      if (fromDate) filter.issuedDate.$gte = new Date(fromDate);
      if (toDate) filter.issuedDate.$lte = new Date(toDate);
    }

    if (search) {
      filter.$or = [{ invoiceNumber: { $regex: search, $options: 'i' } }];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const invoices = await Invoice.find(filter)
      .populate({
        path: 'reservation',
        select: 'guestName email roomNumber checkIn checkOut',
        populate: { path: 'guest', select: 'firstName lastName email phone' }
      })
      .populate('guest', 'firstName lastName email')
      .sort({ issuedDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Invoice.countDocuments(filter);

    const revenueStats = await Invoice.aggregate([
      { $match: { status: { $in: ['Paid', 'Partially Paid'] } } },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$paidAmount' },
          totalPending: { $sum: '$balance' },
          averageInvoice: { $avg: '$totalAmount' }
        }
      }
    ]);

    const stats = {
      total,
      paid: await Invoice.countDocuments({ ...filter, status: 'Paid' }),
      pending: await Invoice.countDocuments({ ...filter, status: { $in: ['Issued', 'Partially Paid'] } }),
      overdue: await Invoice.countDocuments({ 
        ...filter, 
        status: { $in: ['Issued', 'Partially Paid'] },
        dueDate: { $lt: new Date() }
      }),
      totalRevenue: revenueStats[0]?.totalRevenue || 0,
      pendingAmount: revenueStats[0]?.totalPending || 0,
      averageInvoice: revenueStats[0]?.averageInvoice || 0,
      totalInvoiced: await Invoice.aggregate([
        { $match: filter },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).then(result => result[0]?.total || 0)
    };

    res.json({ success: true, count: invoices.length, total, totalPages: Math.ceil(total / parseInt(limit)), currentPage: parseInt(page), stats, data: invoices });
  } catch (error) {
    console.error('Get Invoices Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get single invoice
const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate({
        path: 'reservation',
        select: 'guestName email roomNumber checkIn checkOut adults children specialRequests',
        populate: [
          { path: 'room', select: 'roomNumber type price' },
          { path: 'guest', select: 'firstName lastName email phone' }
        ]
      })
      .populate('guest', 'firstName lastName email phone');

    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    res.json({ success: true, data: invoice });
  } catch (error) {
    console.error('Get Invoice Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create invoice
const createInvoice = async (req, res) => {
  try {
    const { reservationId, additionalServices, additionalChargesTotal, paymentMethod } = req.body;

    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ success: false, message: 'Reservation not found' });
    }

    const room = await Room.findById(reservation.room);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    const nights = Math.ceil((new Date(reservation.checkOut) - new Date(reservation.checkIn)) / (1000 * 60 * 60 * 24));
    const roomCharges = room.price * nights;
    const totalAdditional = parseFloat(additionalChargesTotal) || 0;
    const taxRate = 0.15;
    const subtotal = roomCharges + totalAdditional;
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    const invoice = await Invoice.create({
      reservation: reservationId,
      guest: reservation.guest,
      roomCharges,
      additionalServices: additionalServices || [],
      additionalChargesTotal: totalAdditional,
      taxRate: 15,
      taxAmount,
      totalAmount,
      paidAmount: 0,
      balance: totalAmount,
      status: 'Issued',
      issuedDate: new Date(),
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    const populatedInvoice = await Invoice.findById(invoice._id)
      .populate({ path: 'reservation', populate: { path: 'room', select: 'roomNumber type price' } })
      .populate('guest', 'firstName lastName');

    res.status(201).json({ success: true, message: 'Invoice created successfully', data: populatedInvoice });
  } catch (error) {
    console.error('Create Invoice Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update invoice
const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const updateFields = ['additionalServices', 'additionalChargesTotal', 'status', 'notes'];
    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        invoice[field] = req.body[field];
      }
    });

    if (req.body.additionalChargesTotal !== undefined) {
      invoice.taxAmount = (invoice.roomCharges + invoice.additionalChargesTotal) * (invoice.taxRate / 100);
      invoice.totalAmount = invoice.roomCharges + invoice.additionalChargesTotal + invoice.taxAmount;
      invoice.balance = invoice.totalAmount - invoice.paidAmount;
    }

    await invoice.save();
    res.json({ success: true, message: 'Invoice updated successfully', data: invoice });
  } catch (error) {
    console.error('Update Invoice Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Process payment
const processPayment = async (req, res) => {
  try {
    const { amount, method, reference } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    
    if (!invoice) {
      return res.status(404).json({ success: false, message: 'Invoice not found' });
    }

    const paymentAmount = parseFloat(amount);
    if (paymentAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount' });
    }

    if (paymentAmount > invoice.balance) {
      return res.status(400).json({ success: false, message: 'Payment exceeds balance' });
    }

    invoice.paymentHistory.push({
      amount: paymentAmount,
      method: method || 'Cash',
      date: new Date(),
      reference: reference || `Payment ${invoice.paymentHistory.length + 1}`
    });

    invoice.paidAmount += paymentAmount;
    invoice.balance = invoice.totalAmount - invoice.paidAmount;

    if (invoice.balance <= 0) {
      invoice.status = 'Paid';
    } else {
      invoice.status = 'Partially Paid';
    }

    await invoice.save();

    res.json({ success: true, message: 'Payment processed successfully', data: invoice });
  } catch (error) {
    console.error('Process Payment Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get revenue report
const getRevenueReport = async (req, res) => {
  try {
    const { period = 'monthly', year = new Date().getFullYear() } = req.query;

    let dateGroup;
    if (period === 'daily') {
      dateGroup = { $dateToString: { format: '%Y-%m-%d', date: '$issuedDate' } };
    } else if (period === 'weekly') {
      dateGroup = { $week: '$issuedDate' };
    } else {
      dateGroup = { $month: '$issuedDate' };
    }

    const revenueData = await Invoice.aggregate([
      {
        $match: {
          status: { $in: ['Paid', 'Partially Paid'] },
          issuedDate: { $gte: new Date(`${year}-01-01`), $lte: new Date(`${year}-12-31`) }
        }
      },
      { $group: { _id: dateGroup, totalRevenue: { $sum: '$paidAmount' }, invoiceCount: { $sum: 1 }, averageAmount: { $avg: '$totalAmount' } } },
      { $sort: { _id: 1 } }
    ]);

    const totalRevenue = revenueData.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalInvoices = revenueData.reduce((sum, item) => sum + item.invoiceCount, 0);

    res.json({ success: true, period, year: parseInt(year), totalRevenue, totalInvoices, data: revenueData });
  } catch (error) {
    console.error('Get Revenue Report Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get comprehensive financial dashboard data
const getFinancialDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const thisYear = new Date(today.getFullYear(), 0, 1);

    // Today's revenue
    const todayRevenue = await Invoice.aggregate([
      { $match: { issuedDate: { $gte: today, $lt: tomorrow }, status: { $in: ['Paid', 'Partially Paid'] } } },
      { $group: { _id: null, total: { $sum: '$paidAmount' }, count: { $sum: 1 } } }
    ]);

    // This month revenue
    const thisMonthRevenue = await Invoice.aggregate([
      { $match: { issuedDate: { $gte: thisMonth }, status: { $in: ['Paid', 'Partially Paid'] } } },
      { $group: { _id: null, total: { $sum: '$paidAmount' }, count: { $sum: 1 } } }
    ]);

    // Last month revenue
    const lastMonthRevenue = await Invoice.aggregate([
      { $match: { issuedDate: { $gte: lastMonth, $lt: thisMonth }, status: { $in: ['Paid', 'Partially Paid'] } } },
      { $group: { _id: null, total: { $sum: '$paidAmount' }, count: { $sum: 1 } } }
    ]);

    // Year to date revenue
    const yearToDateRevenue = await Invoice.aggregate([
      { $match: { issuedDate: { $gte: thisYear }, status: { $in: ['Paid', 'Partially Paid'] } } },
      { $group: { _id: null, total: { $sum: '$paidAmount' }, count: { $sum: 1 } } }
    ]);

    // Invoice status breakdown
    const invoiceStatuses = await Invoice.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } }
    ]);

    // Monthly revenue trend (last 12 months)
    const monthlyTrend = await Invoice.aggregate([
      { 
        $match: { 
          issuedDate: { $gte: new Date(today.getFullYear() - 1, today.getMonth(), 1) },
          status: { $in: ['Paid', 'Partially Paid'] }
        } 
      },
      {
        $group: {
          _id: { year: { $year: '$issuedDate' }, month: { $month: '$issuedDate' } },
          revenue: { $sum: '$paidAmount' },
          invoices: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Payment method breakdown
    const paymentMethods = await Invoice.aggregate([
      { $match: { status: { $in: ['Paid', 'Partially Paid'] } } },
      { $group: { _id: '$paymentMethod', count: { $sum: 1 }, total: { $sum: '$paidAmount' } } }
    ]);

    // Top performing room types
    const topRoomTypes = await Invoice.aggregate([
      { $match: { status: { $in: ['Paid', 'Partially Paid'] } } },
      {
        $lookup: {
          from: 'reservations',
          localField: 'reservation',
          foreignField: '_id',
          as: 'reservation'
        }
      },
      { $unwind: '$reservation' },
      {
        $lookup: {
          from: 'rooms',
          localField: 'reservation.room',
          foreignField: '_id',
          as: 'room'
        }
      },
      { $unwind: '$room' },
      {
        $group: {
          _id: '$room.type',
          revenue: { $sum: '$paidAmount' },
          bookings: { $sum: 1 }
        }
      },
      { $sort: { revenue: -1 } },
      { $limit: 5 }
    ]);

    // Aging report
    const agingReport = await Invoice.aggregate([
      { $match: { status: { $in: ['Issued', 'Partially Paid'] } } },
      {
        $addFields: {
          daysOverdue: {
            $divide: [
              { $subtract: [new Date(), '$dueDate'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $bucket: {
          groupBy: '$daysOverdue',
          boundaries: [0, 30, 60, 90],
          default: '90+',
          output: {
            count: { $sum: 1 },
            amount: { $sum: '$balance' }
          }
        }
      }
    ]);

    const dashboard = {
      summary: {
        todayRevenue: todayRevenue[0]?.total || 0,
        todayInvoices: todayRevenue[0]?.count || 0,
        thisMonthRevenue: thisMonthRevenue[0]?.total || 0,
        thisMonthInvoices: thisMonthRevenue[0]?.count || 0,
        lastMonthRevenue: lastMonthRevenue[0]?.total || 0,
        monthOverMonthGrowth: lastMonthRevenue[0]?.total ? 
          ((thisMonthRevenue[0]?.total - lastMonthRevenue[0]?.total) / lastMonthRevenue[0]?.total * 100).toFixed(2) : 0,
        yearToDateRevenue: yearToDateRevenue[0]?.total || 0,
        yearToDateInvoices: yearToDateRevenue[0]?.count || 0
      },
      invoiceStatuses: invoiceStatuses.reduce((acc, item) => {
        acc[item._id] = { count: item.count, amount: item.total };
        return acc;
      }, {}),
      monthlyTrend: monthlyTrend.map(item => ({
        month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
        revenue: item.revenue,
        invoices: item.invoices
      })),
      paymentMethods: paymentMethods.reduce((acc, item) => {
        acc[item._id] = { count: item.count, amount: item.total };
        return acc;
      }, {}),
      topRoomTypes: topRoomTypes,
      agingReport: agingReport.map((item, index) => ({
        period: index === 0 ? 'Current' : index === 1 ? '30-60 days' : index === 2 ? '60-90 days' : '90+ days',
        count: item.count,
        amount: item.amount
      }))
    };

    res.json({ success: true, data: dashboard });
  } catch (error) {
    console.error('Get Financial Dashboard Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { 
  getInvoices, 
  getInvoice, 
  createInvoice,
  updateInvoice, 
  processPayment, 
  getRevenueReport,
  getFinancialDashboard 
};