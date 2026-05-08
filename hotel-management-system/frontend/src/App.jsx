// frontend/src/App.jsx - COMPLETE FIXED
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import GuestNavbar from './components/Layout/GuestNavbar';
import LandingPage from './pages/Landing/LandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import GalleryPage from './pages/Gallery/GalleryPage';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import ManagerDashboard from './pages/Dashboard/ManagerDashboard';
import StaffDashboard from './pages/Dashboard/StaffDashboard';
import HousekeepingDashboard from './pages/Dashboard/HousekeepingDashboard';
import RoomManagement from './pages/Rooms/RoomManagement';
import ReservationList from './pages/Reservations/ReservationList';
import HotelGalleryManage from './pages/Gallery/HotelGalleryManage';
import CreateReservation from './pages/Reservations/CreateReservation';
import CheckInOut from './pages/Reservations/CheckInOut';
import UserManagement from './pages/Users/UserManagement';
import InvoiceGeneration from './pages/Billing/InvoiceGeneration';
import GuestManagement from './pages/Guests/GuestManagement';
import ReportsAnalytics from './pages/Reports/ReportsAnalytics';
import PrivateRoute from './components/Common/PrivateRoute';
import ProfilePage from './pages/Profile/ProfilePage';
import SettingsPage from './pages/Settings/SettingsPage';

function App() {
  const user = JSON.parse(localStorage.getItem('user'));

  return (
    <Router>
      <div className="app-container">
        {/* STAFF/ADMIN - Show full dashboard with sidebar */}
        {user && user.role !== 'guest' ? (
          <>
            <Navbar />
            <div className="main-content">
              <Sidebar />
              <div className="content-area">
                <Routes>
                  <Route path="/login" element={<Navigate to={`/dashboard/${user.role==='admin'?'admin':user.role==='manager'?'manager':'staff'}`} />} />
                  <Route path="/register" element={<Navigate to={`/dashboard/${user.role==='admin'?'admin':user.role==='manager'?'manager':'staff'}`} />} />
                  
                  <Route path="/dashboard/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
                  <Route path="/dashboard/manager" element={<PrivateRoute roles={['manager']}><ManagerDashboard /></PrivateRoute>} />
                  <Route path="/dashboard/staff" element={<PrivateRoute roles={['receptionist','housekeeping','maintenance']}><StaffDashboard /></PrivateRoute>} />
                  <Route path="/dashboard/housekeeping" element={<PrivateRoute roles={['housekeeping']}><HousekeepingDashboard /></PrivateRoute>} />
                  
                  <Route path="/gallery" element={<Navigate to={`/dashboard/${user.role==='admin'?'admin':user.role==='manager'?'manager':'staff'}`} />} />
                  <Route path="/gallery/manage" element={<PrivateRoute roles={['admin']}><HotelGalleryManage /></PrivateRoute>} />
                  
                  <Route path="/rooms" element={<PrivateRoute roles={['admin','manager','receptionist']}><RoomManagement /></PrivateRoute>} />
                  {/* <Route path="/rooms/add" element={<PrivateRoute roles={['admin','manager']}><Navigate to="/rooms" />} />} */}
                  
                  <Route path="/reservations" element={<PrivateRoute roles={['admin','manager','receptionist']}><ReservationList /></PrivateRoute>} />
                  <Route path="/reservations/create" element={<PrivateRoute roles={['admin','manager','receptionist']}><CreateReservation /></PrivateRoute>} />
                  <Route path="/checkin-out" element={<PrivateRoute roles={['admin','manager','receptionist']}><CheckInOut /></PrivateRoute>} />
                  
                  <Route path="/guests" element={<PrivateRoute roles={['admin','manager','receptionist']}><GuestManagement /></PrivateRoute>} />
                  <Route path="/users" element={<PrivateRoute roles={['admin']}><UserManagement /></PrivateRoute>} />
                  <Route path="/billing" element={<PrivateRoute roles={['admin','manager','receptionist']}><InvoiceGeneration /></PrivateRoute>} />
                  <Route path="/reports" element={<PrivateRoute roles={['admin','manager']}><ReportsAnalytics /></PrivateRoute>} />
                  <Route path="/profile" element={<PrivateRoute roles={['admin','manager','receptionist','housekeeping','maintenance']}><ProfilePage /></PrivateRoute>} />
                  <Route path="/settings" element={<PrivateRoute roles={['admin']}><SettingsPage /></PrivateRoute>} />
                  
                  <Route path="/" element={<Navigate to={`/dashboard/${user.role==='admin'?'admin':user.role==='manager'?'manager':'staff'}`} />} />
                  <Route path="*" element={<Navigate to={`/dashboard/${user.role==='admin'?'admin':user.role==='manager'?'manager':'staff'}`} />} />
                </Routes>
              </div>
            </div>
          </>
        ) : user && user.role === 'guest' ? (
          /* GUEST USER - Show navbar + gallery */
          <>
            <GuestNavbar />
            <div style={{ paddingTop: '70px', minHeight: '100vh' }}>
              <Routes>
                <Route path="/" element={<Navigate to="/gallery" />} />
                <Route path="/gallery" element={<GalleryPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/login" element={<Navigate to="/gallery" />} />
                <Route path="/register" element={<Navigate to="/gallery" />} />
                <Route path="*" element={<Navigate to="/gallery" />} />
              </Routes>
            </div>
          </>
        ) : (
          /* NOT LOGGED IN - Landing page */
          <div className="content-area-full">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </div>
        )}
        <ToastContainer position="top-right" autoClose={3000} />
      </div>
    </Router>
  );
}

export default App;