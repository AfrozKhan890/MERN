// backend/controllers/reportController.js (COMPLETE REPLACEMENT)
const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const Invoice = require('../models/Invoice');
const Guest = require('../models/Guest');
const User = require('../models/User');
const HousekeepingTask = require('../models/HousekeepingTask');

// @desc    Get dashboard stats
// @route   GET /api/reports/dashboard
// @access  Private/Admin/Manager
const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    // Room stats
    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
    const availableRooms = await Room.countDocuments({ status: 'Available' });
    const maintenanceRooms = await Room.countDocuments({ status: 'Maintenance' });

    // Reservation stats
    const todayCheckins = await Reservation.countDocuments({
      checkIn: { $gte: today, $lt: tomorrow }
    });
    const todayCheckouts = await Reservation.countDocuments({
      checkOut: { $gte: today, $lt: tomorrow }
    });
    const currentGuests = await Reservation.countDocuments({ status: 'Checked In' });

    // Revenue stats
    const todayRevenue = await Invoice.aggregate([
      { $match: { issuedDate: { $gte: today, $lt: tomorrow }, status: { $in: ['Paid', 'Partially Paid'] } } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } }
    ]);

    const thisMonthRevenue = await Invoice.aggregate([
      { $match: { issuedDate: { $gte: thisMonth }, status: { $in: ['Paid', 'Partially Paid'] } } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } }
    ]);

    const lastMonthRevenue = await Invoice.aggregate([
      { $match: { issuedDate: { $gte: lastMonth, $lt: thisMonth }, status: { $in: ['Paid', 'Partially Paid'] } } },
      { $group: { _id: null, total: { $sum: '$paidAmount' } } }
    ]);

    // Guest stats
    const totalGuests = await Guest.countDocuments();
    const newGuestsThisMonth = await Guest.countDocuments({ createdAt: { $gte: thisMonth } });
    const vipGuests = await Guest.countDocuments({ vipStatus: true });

    // Staff stats
    const totalStaff = await User.countDocuments({ role: { $ne: 'admin' } });
    const activeStaff = await User.countDocuments({ status: 'Active', role: { $ne: 'admin' } });

    // Task stats
    const pendingTasks = await HousekeepingTask.countDocuments({ status: 'Pending' });
    const completedTasksToday = await HousekeepingTask.countDocuments({
      completedDate: { $gte: today, $lt: tomorrow }
    });

    const currentMonthRevenue = thisMonthRevenue[0]?.total || 0;
    const previousMonthRevenue = lastMonthRevenue[0]?.total || 0;
    const revenueGrowth = previousMonthRevenue > 0 
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue * 100).toFixed(2)
      : 0;

    res.json({
      success: true,
      stats: {
        rooms: { totalRooms, occupiedRooms, availableRooms, maintenanceRooms,
          occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : 0
        },
        reservations: { todayCheckins, todayCheckouts, currentGuests },
        revenue: {
          today: todayRevenue[0]?.total || 0,
          thisMonth: currentMonthRevenue,
          lastMonth: previousMonthRevenue,
          revenueGrowth
        },
        guests: { totalGuests, newGuestsThisMonth, vipGuests },
        staff: { totalStaff, activeStaff },
        tasks: { pendingTasks, completedTasksToday }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get occupancy report
// @route   GET /api/reports/occupancy
// @access  Private/Admin/Manager
const getOccupancyReport = async (req, res) => {
  try {
    const { period = 'daily', year = new Date().getFullYear(), month } = req.query;

    // Room type distribution
    const roomTypeDistribution = await Room.aggregate([
      { $group: { _id: '$type', count: { $sum: 1 }, occupied: { 
        $sum: { $cond: [{ $eq: ['$status', 'Occupied'] }, 1, 0] } 
      } } }
    ]);

    // Occupancy by floor
    const occupancyByFloor = await Room.aggregate([
      { $group: { _id: '$floor', total: { $sum: 1 }, occupied: { 
        $sum: { $cond: [{ $eq: ['$status', 'Occupied'] }, 1, 0] } 
      } } },
      { $sort: { _id: 1 } }
    ]);

    // Daily occupancy for current month
    const startDate = month 
      ? new Date(year, parseInt(month) - 1, 1)
      : new Date(year, today.getMonth(), 1);
    const endDate = month
      ? new Date(year, parseInt(month), 0)
      : new Date();

    const dailyOccupancy = await Reservation.aggregate([
      { $match: { checkIn: { $gte: startDate, $lte: endDate } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$checkIn' } },
        reservations: { $sum: 1 },
        checkedIn: { $sum: { $cond: [{ $eq: ['$status', 'Checked In'] }, 1, 0] } }
      } },
      { $sort: { _id: 1 } }
    ]);

    // Revenue by room type
    const revenueByRoomType = await Reservation.aggregate([
      { $match: { status: { $in: ['Checked Out', 'Checked In'] } } },
      { $lookup: { from: 'rooms', localField: 'room', foreignField: '_id', as: 'roomInfo' } },
      { $unwind: '$roomInfo' },
      { $group: { _id: '$roomInfo.type', revenue: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      period,
      year: parseInt(year),
      roomTypeDistribution,
      occupancyByFloor,
      dailyOccupancy,
      revenueByRoomType
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get revenue report
// @route   GET /api/reports/revenue
// @access  Private/Admin/Manager
const getRevenueReport = async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month } = req.query;

    const matchStage = {
      status: { $in: ['Paid', 'Partially Paid'] }
    };

    if (month) {
      const startDate = new Date(year, parseInt(month) - 1, 1);
      const endDate = new Date(year, parseInt(month), 0);
      matchStage.issuedDate = { $gte: startDate, $lte: endDate };
    } else {
      matchStage.issuedDate = {
        $gte: new Date(year, 0, 1),
        $lte: new Date(year, 11, 31)
      };
    }

    // Monthly revenue
    const monthlyRevenue = await Invoice.aggregate([
      { $match: matchStage },
      { $group: {
        _id: { $month: '$issuedDate' },
        revenue: { $sum: '$paidAmount' },
        invoices: { $sum: 1 },
        avgInvoice: { $avg: '$totalAmount' }
      } },
      { $sort: { _id: 1 } }
    ]);

    // Revenue by payment method
    const revenueByPaymentMethod = await Invoice.aggregate([
      { $match: matchStage },
      { $unwind: '$paymentHistory' },
      { $group: {
        _id: '$paymentHistory.method',
        total: { $sum: '$paymentHistory.amount' },
        count: { $sum: 1 }
      } }
    ]);

    // Additional services revenue
    const additionalServicesRevenue = await Invoice.aggregate([
      { $match: matchStage },
      { $group: {
        _id: null,
        totalAdditionalCharges: { $sum: '$additionalChargesTotal' },
        totalRoomCharges: { $sum: '$roomCharges' },
        totalTax: { $sum: '$taxAmount' }
      } }
    ]);

    const totalRevenue = monthlyRevenue.reduce((sum, m) => sum + m.revenue, 0);
    const totalInvoices = monthlyRevenue.reduce((sum, m) => sum + m.invoices, 0);

    res.json({
      success: true,
      year: parseInt(year),
      month: month ? parseInt(month) : null,
      summary: {
        totalRevenue,
        totalInvoices,
        averageInvoice: totalInvoices > 0 ? (totalRevenue / totalInvoices).toFixed(2) : 0,
        ...additionalServicesRevenue[0]
      },
      monthlyRevenue,
      revenueByPaymentMethod
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get guest report
// @route   GET /api/reports/guests
// @access  Private/Admin/Manager
const getGuestReport = async (req, res) => {
  try {
    // Guest demographics
    const guestsByCountry = await Guest.aggregate([
      { $match: { 'address.country': { $exists: true } } },
      { $group: { _id: '$address.country', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Guest preferences
    const guestPreferences = await Guest.aggregate([
      { $group: {
        _id: '$preferences.roomType',
        count: { $sum: 1 }
      } },
      { $match: { _id: { $ne: null, $ne: '' } } }
    ]);

    // Top frequent guests
    const topGuests = await Guest.find({ totalStays: { $gt: 0 } })
      .sort({ totalStays: -1 })
      .limit(10)
      .select('firstName lastName email totalStays vipStatus phone');

    // New guests trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const newGuestTrend = await Guest.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 }
      } },
      { $sort: { _id: 1 } }
    ]);

    // VIP guest stats
    const vipStats = await Guest.aggregate([
      { $match: { vipStatus: true } },
      { $group: { _id: null, count: { $sum: 1 }, avgStays: { $avg: '$totalStays' } } }
    ]);

    res.json({
      success: true,
      guestsByCountry,
      guestPreferences,
      topGuests,
      newGuestTrend,
      vipStats: vipStats[0] || { count: 0, avgStays: 0 }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get staff performance report
// @route   GET /api/reports/staff
// @access  Private/Admin
const getStaffReport = async (req, res) => {
  try {
    // Staff by department
    const staffByDepartment = await User.aggregate([
      { $match: { role: { $ne: 'admin' } } },
      { $group: { _id: '$department', count: { $sum: 1 }, roles: { $addToSet: '$role' } } }
    ]);

    // Staff by role
    const staffByRole = await User.aggregate([
      { $match: { role: { $ne: 'admin' } } },
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Housekeeping performance
    const housekeepingPerformance = await HousekeepingTask.aggregate([
      { $match: { assignedTo: { $ne: null } } },
      { $group: {
        _id: '$assignedTo',
        totalTasks: { $sum: 1 },
        completedTasks: { $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] } },
        pendingTasks: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } }
      } },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'staff' } },
      { $unwind: '$staff' },
      { $project: {
        name: '$staff.name',
        department: '$staff.department',
        totalTasks: 1,
        completedTasks: 1,
        pendingTasks: 1,
        completionRate: { 
          $cond: [{ $gt: ['$totalTasks', 0] }, 
            { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] }, 
            0 
          ] 
        }
      } }
    ]);

    res.json({
      success: true,
      staffByDepartment,
      staffByRole,
      housekeepingPerformance
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDashboardStats,
  getOccupancyReport,
  getRevenueReport,
  getGuestReport,
  getStaffReport
};