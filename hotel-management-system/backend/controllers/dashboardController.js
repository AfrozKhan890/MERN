// backend/controllers/dashboardController.js - COMPLETE FIXED
const Room = require('../models/Room');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const Invoice = require('../models/Invoice');
const HousekeepingTask = require('../models/HousekeepingTask');

const getAdminDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const totalRooms = await Room.countDocuments();
    const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
    const availableRooms = await Room.countDocuments({ status: 'Available' });
    const maintenanceRooms = await Room.countDocuments({ status: 'Maintenance' });
    const cleaningRooms = await Room.countDocuments({ status: 'Cleaning' });

    // REAL user counts from database
    const totalUsers = await User.countDocuments();
    const totalGuests = await User.countDocuments({ role: 'guest' });
    const totalStaff = await User.countDocuments({ role: { $ne: 'guest' } });
    const activeStaff = await User.countDocuments({ status: 'Active', role: { $ne: 'guest' } });
    const newGuestsToday = await User.countDocuments({
      role: 'guest',
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const todayCheckins = await Reservation.countDocuments({ checkIn: { $gte: today, $lt: tomorrow } });
    const todayCheckouts = await Reservation.countDocuments({ checkOut: { $gte: today, $lt: tomorrow } });
    const totalReservations = await Reservation.countDocuments({ status: 'Confirmed' });
    const pendingReservations = await Reservation.countDocuments({ status: 'Pending' });

    const paidInvoices = await Invoice.find({ status: 'Paid' });
    const todayRevenue = paidInvoices
      .filter(inv => new Date(inv.issuedDate) >= today)
      .reduce((sum, inv) => sum + inv.totalAmount, 0);
    const monthlyRevenue = paidInvoices
      .filter(inv => {
        const invDate = new Date(inv.issuedDate);
        return invDate.getMonth() === today.getMonth() && invDate.getFullYear() === today.getFullYear();
      })
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const recentBookings = await Reservation.find()
      .populate('room', 'roomNumber type')
      .sort({ createdAt: -1 })
      .limit(5);

    const roomStatusDistribution = await Room.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const pendingTasks = await HousekeepingTask.countDocuments({ status: 'Pending' });

    res.json({
      success: true,
      stats: {
        totalRooms, occupiedRooms, availableRooms, maintenanceRooms, cleaningRooms,
        occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : 0,
        totalUsers, totalGuests, totalStaff, activeStaff, newGuestsToday,
        totalReservations, pendingReservations, todayCheckins, todayCheckouts,
        todayRevenue: todayRevenue || 0, monthlyRevenue: monthlyRevenue || 0, pendingTasks
      },
      recentBookings, roomStatusDistribution
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getManagerDashboard = async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: 'Available' });
    const occupiedRooms = await Room.countDocuments({ status: 'Occupied' });
    const maintenanceRooms = await Room.countDocuments({ status: 'Maintenance' });

    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);

    const todayCheckins = await Reservation.countDocuments({ checkIn: { $gte: today, $lt: tomorrow } });
    const todayCheckouts = await Reservation.countDocuments({ checkOut: { $gte: today, $lt: tomorrow } });
    const pendingTasks = await HousekeepingTask.countDocuments({ status: 'Pending' });
    const pendingReservations = await Reservation.countDocuments({ status: 'Pending' });

    const recentActivities = await Reservation.find().populate('room','roomNumber').sort({ updatedAt: -1 }).limit(10);
    const recentTasks = await HousekeepingTask.find().populate('assignedTo','name').populate('room','roomNumber').sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      stats: { totalRooms, availableRooms, occupiedRooms, maintenanceRooms,
        occupancyRate: totalRooms > 0 ? ((occupiedRooms / totalRooms) * 100).toFixed(2) : 0,
        todayCheckins, todayCheckouts, pendingTasks, pendingReservations },
      recentActivities, recentTasks
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStaffDashboard = async (req, res) => {
  try {
    const today = new Date(); today.setHours(0,0,0,0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate()+1);

    const myTodayTasks = await HousekeepingTask.find({
      assignedTo: req.user._id,
      scheduledDate: { $gte: today, $lt: tomorrow }
    }).populate('room','roomNumber');

    const pendingTasks = myTodayTasks.filter(t => t.status === 'Pending').length;
    const completedTasks = myTodayTasks.filter(t => t.status === 'Completed').length;

    const todayCheckins = await Reservation.find({
      checkIn: { $gte: today, $lt: tomorrow }
    }).populate('room','roomNumber').limit(10);

    res.json({
      success: true,
      stats: {
        totalTasks: myTodayTasks.length, pendingTasks, completedTasks,
        completionRate: myTodayTasks.length > 0 ? ((completedTasks / myTodayTasks.length) * 100).toFixed(2) : 0
      },
      todayTasks: myTodayTasks, todayCheckins
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAdminDashboard, getManagerDashboard, getStaffDashboard };