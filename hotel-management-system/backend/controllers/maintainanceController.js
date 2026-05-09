// backend/controllers/maintenanceController.js
const MaintenanceRequest = require('../models/MaintenanceRequest');
const Room = require('../models/Room');
const Notification = require('../models/Notification');

// @desc    Get all maintenance requests
const getRequests = async (req, res) => {
  try {
    const { status, priority, page = 1, limit = 20 } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    
    // If user is maintenance staff, show assigned to them
    if (req.user.role === 'maintenance') {
      filter.assignedTo = req.user._id;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const requests = await MaintenanceRequest.find(filter)
      .populate('room', 'roomNumber type floor')
      .populate('reportedBy', 'name')
      .populate('assignedTo', 'name')
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await MaintenanceRequest.countDocuments(filter);
    
    const stats = {
      total,
      reported: await MaintenanceRequest.countDocuments({ status: 'Reported' }),
      assigned: await MaintenanceRequest.countDocuments({ status: 'Assigned' }),
      inProgress: await MaintenanceRequest.countDocuments({ status: 'In Progress' }),
      completed: await MaintenanceRequest.countDocuments({ status: 'Completed' }),
      urgent: await MaintenanceRequest.countDocuments({ priority: 'Urgent', status: { $ne: 'Completed' } })
    };
    
    res.json({ success: true, count: requests.length, total, stats, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single request
const getRequest = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id)
      .populate('room', 'roomNumber type floor status')
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name email');
    
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create maintenance request
const createRequest = async (req, res) => {
  try {
    const { roomId, issue, category, priority, notes } = req.body;
    
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    
    const request = await MaintenanceRequest.create({
      room: roomId,
      roomNumber: room.roomNumber,
      reportedBy: req.user._id,
      issue,
      category,
      priority: priority || 'Medium',
      notes
    });
    
    // Notify admin/manager about new request
    const admins = await User.find({ role: { $in: ['admin', 'manager'] } });
    for (const admin of admins) {
      await Notification.create({
        recipient: admin._id,
        type: 'maintenance',
        title: 'New Maintenance Request',
        message: `Room ${room.roomNumber}: ${issue.substring(0, 50)}`,
        priority: priority === 'Urgent' ? 'urgent' : 'medium',
        data: { taskId: request._id, roomId }
      });
    }
    
    res.status(201).json({ success: true, message: 'Request submitted', data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update request
const updateRequest = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    
    const { status, notes, cost } = req.body;
    if (status) request.status = status;
    if (notes) request.notes = notes;
    if (cost) request.cost = cost;
    if (status === 'Completed') request.completedDate = new Date();
    
    await request.save();
    res.json({ success: true, message: 'Request updated', data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Assign request to staff
const assignRequest = async (req, res) => {
  try {
    const { userId } = req.body;
    const request = await MaintenanceRequest.findById(req.params.id);
    
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    
    request.assignedTo = userId;
    request.status = 'Assigned';
    await request.save();
    
    // Notify assigned staff
    await Notification.create({
      recipient: userId,
      type: 'maintenance',
      title: 'Maintenance Task Assigned',
      message: `Room ${request.roomNumber}: ${request.issue.substring(0, 50)}`,
      priority: request.priority === 'Urgent' ? 'urgent' : 'medium',
      data: { taskId: request._id }
    });
    
    res.json({ success: true, message: 'Request assigned', data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Complete request
const completeRequest = async (req, res) => {
  try {
    const request = await MaintenanceRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });
    
    request.status = 'Completed';
    request.completedDate = new Date();
    await request.save();
    
    res.json({ success: true, message: 'Request completed', data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getRequests, getRequest, createRequest, updateRequest, assignRequest, completeRequest };