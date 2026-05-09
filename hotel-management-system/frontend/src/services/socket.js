// frontend/src/services/socket.js - Socket.IO Client Service (FIXED for React)
import { io } from 'socket.io-client';

// Use environment variable with REACT_APP_ prefix, or default to localhost
// const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

let socket = null;
let hasLoggedConnectionError = false;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 1200,
      timeout: 5000
    });
    
    socket.on('connect', () => {
      console.log('Socket.IO connected:', socket.id);
      hasLoggedConnectionError = false;
      
      // Register user with socket
      const user = JSON.parse(localStorage.getItem('user'));
      if (user && user._id) {
        socket.emit('register-user', user._id);
      }
      
      // If user is admin/manager, join admin room
      if (user && (user.role === 'admin' || user.role === 'manager')) {
        socket.emit('join-admin');
      }
    });
    
    socket.on('connect_error', (error) => {
      if (!hasLoggedConnectionError) {
        console.warn('Socket.IO connection issue. Backend may be offline.');
        hasLoggedConnectionError = true;
      }
    });
    
    socket.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
    });
    
    socket.on('error', (error) => {
      console.error('Socket.IO error:', error);
    });
  }
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initializeSocket();
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Real-time event listeners
export const onNewReservation = (callback) => {
  const socket = getSocket();
  socket.on('new-reservation', callback);
  return () => socket.off('new-reservation', callback);
};

export const onRoomStatusUpdate = (callback) => {
  const socket = getSocket();
  socket.on('room-status-update', callback);
  return () => socket.off('room-status-update', callback);
};

export const onNotification = (callback) => {
  const socket = getSocket();
  socket.on('notification', callback);
  return () => socket.off('notification', callback);
};

export const emitRoomStatusChange = (roomId, status) => {
  const socket = getSocket();
  socket.emit('room-status-change', { roomId, status });
};

export const emitNewBooking = (bookingData) => {
  const socket = getSocket();
  socket.emit('new-booking', bookingData);
};

export const onEvent = (eventName, callback) => {
  const socket = getSocket();
  socket.on(eventName, callback);
  return () => socket.off(eventName, callback);
};