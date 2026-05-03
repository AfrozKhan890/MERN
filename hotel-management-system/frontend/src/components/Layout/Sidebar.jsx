// frontend/src/components/Layout/Sidebar.jsx (REPLACE COMPLETELY)
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FaTachometerAlt, FaBed, FaCalendarCheck, FaUsers, 
  FaFileInvoiceDollar, FaChartBar, FaUserFriends,
  FaExchangeAlt
} from 'react-icons/fa';
import './Sidebar.css';

const Sidebar = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user) return null;

  const menuItems = {
    admin: [
      { path: '/dashboard/admin', icon: <FaTachometerAlt />, label: 'Dashboard' },
      { path: '/rooms', icon: <FaBed />, label: 'Rooms' },
      { path: '/reservations', icon: <FaCalendarCheck />, label: 'Reservations' },
      { path: '/checkin-out', icon: <FaExchangeAlt />, label: 'Check In/Out' },
      { path: '/guests', icon: <FaUserFriends />, label: 'Guests' },
      { path: '/users', icon: <FaUsers />, label: 'Staff' },
      { path: '/billing', icon: <FaFileInvoiceDollar />, label: 'Billing' },
      { path: '/reports', icon: <FaChartBar />, label: 'Reports' },
    ],
    manager: [
      { path: '/dashboard/manager', icon: <FaTachometerAlt />, label: 'Dashboard' },
      { path: '/rooms', icon: <FaBed />, label: 'Rooms' },
      { path: '/reservations', icon: <FaCalendarCheck />, label: 'Reservations' },
      { path: '/checkin-out', icon: <FaExchangeAlt />, label: 'Check In/Out' },
      { path: '/guests', icon: <FaUserFriends />, label: 'Guests' },
      { path: '/billing', icon: <FaFileInvoiceDollar />, label: 'Billing' },
      { path: '/reports', icon: <FaChartBar />, label: 'Reports' },
    ],
    receptionist: [
      { path: '/dashboard/staff', icon: <FaTachometerAlt />, label: 'Dashboard' },
      { path: '/reservations', icon: <FaCalendarCheck />, label: 'Reservations' },
      { path: '/checkin-out', icon: <FaExchangeAlt />, label: 'Check In/Out' },
      { path: '/guests', icon: <FaUserFriends />, label: 'Guests' },
      { path: '/billing', icon: <FaFileInvoiceDollar />, label: 'Billing' },
    ],
    housekeeping: [
      { path: '/dashboard/housekeeping', icon: <FaTachometerAlt />, label: 'Dashboard' },
      { path: '/dashboard/staff', icon: <FaCalendarCheck />, label: 'Tasks' },
    ],
    maintenance: [
      { path: '/dashboard/staff', icon: <FaTachometerAlt />, label: 'Dashboard' },
    ]
  };

  const currentMenuItems = menuItems[user.role] || [];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h5>{user.role?.charAt(0).toUpperCase() + user.role?.slice(1)} Menu</h5>
      </div>
      <ul className="sidebar-menu">
        {currentMenuItems.map((item, index) => (
          <li key={index} className={location.pathname === item.path ? 'active' : ''}>
            <Link to={item.path}>
              <span className="menu-icon">{item.icon}</span>
              <span className="menu-label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;