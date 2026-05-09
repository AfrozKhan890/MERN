// frontend/src/App.jsx - FIXED MULTI-TAB & ROUTING
import React, { useEffect, useState, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

import UnifiedNavbar from './components/Layout/UnifiedNavbar';
import Sidebar from './components/Layout/Sidebar';
import LandingPage from './pages/Landing/LandingPage';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import GalleryPage from './pages/Gallery/GalleryPage';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import ManagerDashboard from './pages/Dashboard/ManagerDashboard';
import StaffDashboard from './pages/Dashboard/StaffDashboard';
import HousekeepingDashboard from './pages/Dashboard/HousekeepingDashboard';
import ReservationList from './pages/Reservations/ReservationList';
import HotelGalleryManage from './pages/Gallery/HotelGalleryManage';
import CreateReservation from './pages/Reservations/CreateReservation';
import CheckInOut from './pages/Reservations/CheckInOut';
import UserManagement from './pages/Users/UserManagement';
import InvoiceGeneration from './pages/Billing/InvoiceGeneration';
import GuestManagement from './pages/Guests/GuestManagement';
import ReportsAnalytics from './pages/Reports/ReportsAnalytics';
import PrivateRoute from './components/common/PrivateRoute';
import ProfilePage from './pages/Profile/ProfilePage';
import SettingsPage from './pages/Settings/SettingsPage';
import { disconnectSocket, initializeSocket } from './services/socket';

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); }
    catch { return null; }
  });

  const refreshUser = useCallback(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user'));
      setUser(u);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Listen for storage changes across tabs
    const handleStorage = (e) => {
      if (e.key === 'user') {
        refreshUser();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [refreshUser]);

  useEffect(() => {
    if (user?.token) {
      initializeSocket();
    }
    return () => { disconnectSocket(); };
  }, [user?.token]);

  const getDashboardRoute = () => {
    if (!user) return '/';
    if (user.role === 'guest') return '/gallery';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'manager') return '/dashboard/manager';
    return '/dashboard/staff';
  };

  const isStaff = user && user.role !== 'guest';
  const isGuest = user && user.role === 'guest';

  return (
    <Router>
      <div className="app-container">
        <UnifiedNavbar />
        
        {/* STAFF/ADMIN - Full dashboard with sidebar */}
        {isStaff ? (
          <div className="main-content">
            <Sidebar />
            <div className="content-area">
              <Routes>
                {/* Auth pages now render instead of redirect - no more cross-tab hijacking */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                <Route path="/dashboard/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
                <Route path="/dashboard/manager" element={<PrivateRoute roles={['manager']}><ManagerDashboard /></PrivateRoute>} />
                <Route path="/dashboard/staff" element={<PrivateRoute roles={['receptionist','housekeeping','maintenance']}><StaffDashboard /></PrivateRoute>} />
                <Route path="/dashboard/housekeeping" element={<PrivateRoute roles={['housekeeping']}><HousekeepingDashboard /></PrivateRoute>} />
                
                <Route path="/gallery" element={<Navigate to={getDashboardRoute()} replace />} />
                <Route path="/gallery/manage" element={<PrivateRoute roles={['admin']}><HotelGalleryManage /></PrivateRoute>} />
                
                <Route path="/reservations" element={<PrivateRoute roles={['admin','manager','receptionist']}><ReservationList /></PrivateRoute>} />
                <Route path="/reservations/create" element={<PrivateRoute roles={['admin','manager','receptionist']}><CreateReservation /></PrivateRoute>} />
                <Route path="/checkin-out" element={<PrivateRoute roles={['admin','manager','receptionist']}><CheckInOut /></PrivateRoute>} />
                
                <Route path="/guests" element={<PrivateRoute roles={['admin','manager','receptionist']}><GuestManagement /></PrivateRoute>} />
                <Route path="/users" element={<PrivateRoute roles={['admin']}><UserManagement /></PrivateRoute>} />
                <Route path="/billing" element={<PrivateRoute roles={['admin','manager','receptionist']}><InvoiceGeneration /></PrivateRoute>} />
                <Route path="/reports" element={<PrivateRoute roles={['admin','manager']}><ReportsAnalytics /></PrivateRoute>} />
                <Route path="/profile" element={<PrivateRoute roles={['admin','manager','receptionist','housekeeping','maintenance']}><ProfilePage /></PrivateRoute>} />
                <Route path="/settings" element={<PrivateRoute roles={['admin']}><SettingsPage /></PrivateRoute>} />
                
                <Route path="/" element={<Navigate to={getDashboardRoute()} replace />} />
                <Route path="*" element={<Navigate to={getDashboardRoute()} replace />} />
              </Routes>
            </div>
          </div>
        ) : isGuest ? (
          /* GUEST - Simple layout without sidebar */
          <div className="content-area-full" style={{ paddingTop: '70px' }}>
            <Routes>
              <Route path="/" element={<Navigate to="/gallery" replace />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/gallery" replace />} />
            </Routes>
          </div>
        ) : (
          /* NOT LOGGED IN - Landing page */
          <div className="content-area-full">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/gallery" element={<GalleryPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        )}
        
        <ToastContainer 
          position="top-right" 
          autoClose={3000}
          theme="colored"
          newestOnTop={true}
          closeOnClick
          pauseOnHover
        />
      </div>
    </Router>
  );
}

export default App;