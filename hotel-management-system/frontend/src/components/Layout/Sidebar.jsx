// frontend/src/components/Layout/Sidebar.jsx - REMOVE EXTRA GUEST LINK
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, FaBed, FaCalendarCheck, FaUsers, 
  FaFileInvoiceDollar, FaChartBar, FaUserFriends,
  FaExchangeAlt, FaUserCircle, FaCog, FaBars, FaTimes,
  FaImages
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const menuItems = {
    admin: [
      { path: '/dashboard/admin', icon: <FaTachometerAlt />, label: 'Dashboard' },
      { path: '/reservations', icon: <FaCalendarCheck />, label: 'Reservations' },
      { path: '/checkin-out', icon: <FaExchangeAlt />, label: 'Check In/Out' },
      { path: '/guests', icon: <FaUserFriends />, label: 'Guests' },
      { path: '/users', icon: <FaUsers />, label: 'Staff' },
      { path: '/billing', icon: <FaFileInvoiceDollar />, label: 'Billing' },
      { path: '/reports', icon: <FaChartBar />, label: 'Reports' },
      { path: '/gallery/manage', icon: <FaImages />, label: 'Manage Gallery' },
      { path: '/profile', icon: <FaUserCircle />, label: 'My Profile' },
      { path: '/settings', icon: <FaCog />, label: 'Settings' },
    ],
    manager: [
      { path: '/dashboard/manager', icon: <FaTachometerAlt />, label: 'Dashboard' },
      { path: '/reservations', icon: <FaCalendarCheck />, label: 'Reservations' },
      { path: '/checkin-out', icon: <FaExchangeAlt />, label: 'Check In/Out' },
      { path: '/guests', icon: <FaUserFriends />, label: 'Guests' },
      { path: '/billing', icon: <FaFileInvoiceDollar />, label: 'Billing' },
      { path: '/reports', icon: <FaChartBar />, label: 'Reports' },
      { path: '/profile', icon: <FaUserCircle />, label: 'My Profile' },
    ],
    receptionist: [
      { path: '/dashboard/staff', icon: <FaTachometerAlt />, label: 'Dashboard' },
      { path: '/reservations', icon: <FaCalendarCheck />, label: 'Reservations' },
      { path: '/checkin-out', icon: <FaExchangeAlt />, label: 'Check In/Out' },
      { path: '/guests', icon: <FaUserFriends />, label: 'Guests' },
      { path: '/billing', icon: <FaFileInvoiceDollar />, label: 'Billing' },
      { path: '/profile', icon: <FaUserCircle />, label: 'My Profile' },
    ],
    housekeeping: [
      { path: '/dashboard/housekeeping', icon: <FaTachometerAlt />, label: 'Dashboard' },
      { path: '/dashboard/staff', icon: <FaCalendarCheck />, label: 'Tasks' },
      { path: '/profile', icon: <FaUserCircle />, label: 'My Profile' },
    ],
    maintenance: [
      { path: '/dashboard/staff', icon: <FaTachometerAlt />, label: 'Dashboard' },
      { path: '/profile', icon: <FaUserCircle />, label: 'My Profile' },
    ]
  };

  const currentMenuItems = menuItems[user.role] || [];

  return (
    <>
      <button className="sidebar-hamburger" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes /> : <FaBars />}
      </button>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h5>{user.role?.charAt(0).toUpperCase() + user.role?.slice(1)} Menu</h5>
        </div>
        <ul className="sidebar-menu">
          {currentMenuItems.map((item, index) => (
            <li key={index} className={location.pathname === item.path ? 'active' : ''}>
              <Link to={item.path} onClick={() => setIsOpen(false)}>
                <span className="menu-icon">{item.icon}</span>
                <span className="menu-label">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Sidebar;