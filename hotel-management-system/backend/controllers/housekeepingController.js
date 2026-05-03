// backend/controllers/housekeepingController.js
const HousekeepingTask = require('../models/HousekeepingTask');
const Room = require('../models/Room');
const User = require('../models/User');

// @desc    Get all housekeeping tasks
// @route   GET /api/housekeeping
// @access  Private
const getTasks = async (req, res) => {
  try {
    const { 
      status, 
      priority, 
      taskType,
      assignedTo,
      roomNumber,
      fromDate,
      toDate,
      search,
      page = 1, 
      limit = 20 
    } = req.query;

    const filter = {};

    // Filter by status
    if (status) filter.status = status;
    
    // Filter by priority
    if (priority) filter.priority = priority;
    
    // Filter by task type
    if (taskType) filter.taskType = taskType;
    
    // Filter by assigned staff
    if (assignedTo) filter.assignedTo = assignedTo;
    
    // Filter by room number
    if (roomNumber) filter.roomNumber = { $regex: roomNumber, $options: 'i' };
    
    // Filter by date range
    if (fromDate || toDate) {
      filter.scheduledDate = {};
      if (fromDate) filter.scheduledDate.$gte = new Date(fromDate);
      if (toDate) filter.scheduledDate.$lte = new Date(toDate);
    }

    // If user is housekeeping staff, show only their tasks
    if (req.user.role === 'housekeeping') {
      filter.assignedTo = req.user._id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tasks = await HousekeepingTask.find(filter)
      .populate('assignedTo', 'name email')
      .populate('room', 'roomNumber type floor')
      .populate('createdBy', 'name')
      .sort({ scheduledDate: 1, priority: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await HousekeepingTask.countDocuments(filter);

    // Get statistics
    const stats = {
      total: total,
      pending: await HousekeepingTask.countDocuments({ ...filter, status: 'Pending' }),
      inProgress: await HousekeepingTask.countDocuments({ ...filter, status: 'In Progress' }),
      completed: await HousekeepingTask.countDocuments({ ...filter, status: 'Completed' }),
      highPriority: await HousekeepingTask.countDocuments({ 
        ...filter, 
        priority: { $in: ['High', 'Urgent'] } 
      })
    };

    res.json({
      success: true,
      count: tasks.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      stats,
      data: tasks
    });
  } catch (error) {
    console.error('Get Tasks Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get single task
// @route   GET /api/housekeeping/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await HousekeepingTask.findById(req.params.id)
      .populate('assignedTo', 'name email phone')
      .populate('room', 'roomNumber type floor status')
      .populate('createdBy', 'name');

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    res.json({
      success: true,
      data: task
    });
  } catch (error) {
    console.error('Get Task Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Create housekeeping task
// @route   POST /api/housekeeping
// @access  Private
const createTask = async (req, res) => {
  try {
    const {
      roomId,
      taskType,
      priority,
      scheduledDate,
      assignedTo,
      notes
    } = req.body;

    // Validate room exists
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    // Create task
    const task = await HousekeepingTask.create({
      room: roomId,
      roomNumber: room.roomNumber,
      taskType: taskType || 'Cleaning',
      priority: priority || 'Medium',
      scheduledDate: scheduledDate || new Date(),
      assignedTo: assignedTo || null,
      notes,
      createdBy: req.user._id
    });

    // Update room status to cleaning if task is cleaning type
    if (taskType === 'Cleaning' || taskType === 'Deep Cleaning') {
      room.status = 'Cleaning';
      room.lastCleaned = new Date();
      await room.save();
    }

    const populatedTask = await HousekeepingTask.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('room', 'roomNumber type')
      .populate('createdBy', 'name');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask
    });
  } catch (error) {
    console.error('Create Task Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Update task
// @route   PUT /api/housekeeping/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    const task = await HousekeepingTask.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    const updateFields = [
      'taskType', 'priority', 'status', 'assignedTo', 
      'scheduledDate', 'notes'
    ];

    const previousStatus = task.status;

    updateFields.forEach(field => {
      if (req.body[field] !== undefined) {
        task[field] = req.body[field];
      }
    });

    // If task is completed, set completed date
    if (req.body.status === 'Completed' && previousStatus !== 'Completed') {
      task.completedDate = new Date();
      
      // Update room status to available
      const room = await Room.findById(task.room);
      if (room && (task.taskType === 'Cleaning' || task.taskType === 'Deep Cleaning')) {
        room.status = 'Available';
        await room.save();
      }
    }

    // If task is in progress, keep room as cleaning
    if (req.body.status === 'In Progress') {
      const room = await Room.findById(task.room);
      if (room) {
        room.status = 'Cleaning';
        await room.save();
      }
    }

    await task.save();

    const updatedTask = await HousekeepingTask.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('room', 'roomNumber type status')
      .populate('createdBy', 'name');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Update Task Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Complete task
// @route   PUT /api/housekeeping/:id/complete
// @access  Private
const completeTask = async (req, res) => {
  try {
    const task = await HousekeepingTask.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    task.status = 'Completed';
    task.completedDate = new Date();
    await task.save();

    // Update room status to available
    const room = await Room.findById(task.room);
    if (room) {
      room.status = 'Available';
      room.lastCleaned = new Date();
      await room.save();
    }

    const updatedTask = await HousekeepingTask.findById(task._id)
      .populate('assignedTo', 'name')
      .populate('room', 'roomNumber type');

    res.json({
      success: true,
      message: 'Task completed successfully',
      data: updatedTask
    });
  } catch (error) {
    console.error('Complete Task Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Assign task to staff
// @route   PUT /api/housekeeping/:id/assign
// @access  Private/Manager/Admin
const assignTask = async (req, res) => {
  try {
    const { userId } = req.body;

    const task = await HousekeepingTask.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Staff member not found' });
    }

    task.assignedTo = userId;
    task.status = 'Pending';
    await task.save();

    const updatedTask = await HousekeepingTask.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('room', 'roomNumber type');

    res.json({
      success: true,
      message: `Task assigned to ${user.name}`,
      data: updatedTask
    });
  } catch (error) {
    console.error('Assign Task Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get my tasks (for logged in user)
// @route   GET /api/housekeeping/my-tasks
// @access  Private
const getMyTasks = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tasks = await HousekeepingTask.find({
      assignedTo: req.user._id,
      scheduledDate: { $gte: today }
    })
    .populate('room', 'roomNumber type floor')
    .sort({ priority: -1, scheduledDate: 1 });

    const stats = {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'Pending').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      completed: tasks.filter(t => t.status === 'Completed').length
    };

    res.json({
      success: true,
      count: tasks.length,
      stats,
      data: tasks
    });
  } catch (error) {
    console.error('Get My Tasks Error:', error);
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  completeTask,
  assignTask,
  getMyTasks
};