// server.js - COMPLETE (Add these routes)
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
let morgan = null;
try {
  // Optional in case dependency install fails on local machine.
  morgan = require('morgan');
} catch (error) {
  morgan = null;
}

dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const roomRoutes = require('./routes/roomRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const billingRoutes = require('./routes/billingRoutes');
const housekeepingRoutes = require('./routes/housekeepingRoutes');
const reportRoutes = require('./routes/reportRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const hotelRoutes = require('./routes/hotelRoutes');

// ========== YEH ROUTES ADD KARO (Missing the) ==========
const guestRoutes = require('./routes/guestRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

const { errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

app.set('io', io);

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
if (morgan) {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const metrics = {
  startedAt: new Date().toISOString(),
  totalRequests: 0,
  byMethod: {},
  byStatus: {}
};

app.use((req, res, next) => {
  metrics.totalRequests += 1;
  metrics.byMethod[req.method] = (metrics.byMethod[req.method] || 0) + 1;
  res.on('finish', () => {
    const statusGroup = `${Math.floor(res.statusCode / 100)}xx`;
    metrics.byStatus[statusGroup] = (metrics.byStatus[statusGroup] || 0) + 1;
  });
  next();
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api', apiLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many auth requests. Please try again later.'
  }
});

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const fs = require('fs');
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

io.on('connection', (socket) => {
  socket.on('join-admin', () => {
    socket.join('admins');
  });

  socket.on('register-user', (userId) => {
    if (userId) socket.join(`user:${userId}`);
  });

  socket.on('disconnect', () => {
    // no-op
  });
});

// Routes - Yeh sab already hai
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/housekeeping', housekeepingRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/hotels', hotelRoutes);

// ========== YEH DO ROUTES ADD KARO ==========
app.use('/api/guests', guestRoutes);
app.use('/api/feedback', feedbackRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Hotel Management API is running',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

app.get('/api/metrics', (req, res) => {
  res.json({
    success: true,
    metrics: {
      ...metrics,
      uptimeSeconds: Math.floor(process.uptime()),
      memory: process.memoryUsage()
    }
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/luxury_hotel');
    console.log('MongoDB Connected Successfully');
  } catch (err) {
    console.error('MongoDB Connection Error:', err.message);
    console.log('Starting server without database connection');
  }

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

module.exports = { app, startServer, server };