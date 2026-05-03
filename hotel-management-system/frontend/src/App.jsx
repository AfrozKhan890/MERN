// frontend/src/App.jsx (SIMPLIFIED)
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import ManagerDashboard from './pages/Dashboard/ManagerDashboard';
import StaffDashboard from './pages/Dashboard/StaffDashboard';
import HousekeepingDashboard from './pages/Dashboard/HousekeepingDashboard';
import RoomManagement from './pages/Rooms/RoomManagement';
import AddRoom from './pages/Rooms/AddRoom';
import ReservationList from './pages/Reservations/ReservationList';
import CreateReservation from './pages/Reservations/CreateReservation';
import CheckInOut from './pages/Reservations/CheckInOut';
import UserManagement from './pages/Users/UserManagement';
import InvoiceGeneration from './pages/Billing/InvoiceGeneration';
import GuestManagement from './pages/Guests/GuestManagement';
import ReportsAnalytics from './pages/Reports/ReportsAnalytics';
import PrivateRoute from './components/Common/PrivateRoute';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <div className="main-content">
          <Sidebar />
          <div className="content-area">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/dashboard/admin" element={
                <PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>
              } />
              <Route path="/dashboard/manager" element={
                <PrivateRoute roles={['manager']}><ManagerDashboard /></PrivateRoute>
              } />
              <Route path="/dashboard/staff" element={
                <PrivateRoute roles={['receptionist','housekeeping','maintenance']}><StaffDashboard /></PrivateRoute>
              } />
              <Route path="/dashboard/housekeeping" element={
                <PrivateRoute roles={['housekeeping']}><HousekeepingDashboard /></PrivateRoute>
              } />
              
              <Route path="/rooms" element={
                <PrivateRoute roles={['admin','manager','receptionist']}><RoomManagement /></PrivateRoute>
              } />
              <Route path="/rooms/add" element={
                <PrivateRoute roles={['admin','manager']}><AddRoom /></PrivateRoute>
              } />
              
              <Route path="/reservations" element={
                <PrivateRoute roles={['admin','manager','receptionist']}><ReservationList /></PrivateRoute>
              } />
              <Route path="/reservations/create" element={
                <PrivateRoute roles={['admin','manager','receptionist']}><CreateReservation /></PrivateRoute>
              } />
              <Route path="/checkin-out" element={
                <PrivateRoute roles={['admin','manager','receptionist']}><CheckInOut /></PrivateRoute>
              } />
              
              <Route path="/guests" element={
                <PrivateRoute roles={['admin','manager','receptionist']}><GuestManagement /></PrivateRoute>
              } />
              <Route path="/users" element={
                <PrivateRoute roles={['admin']}><UserManagement /></PrivateRoute>
              } />
              <Route path="/billing" element={
                <PrivateRoute roles={['admin','manager','receptionist']}><InvoiceGeneration /></PrivateRoute>
              } />
              <Route path="/reports" element={
                <PrivateRoute roles={['admin','manager']}><ReportsAnalytics /></PrivateRoute>
              } />
              
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;