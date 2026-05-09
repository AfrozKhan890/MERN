// frontend/src/components/common/PrivateRoute.jsx (REPLACE COMPLETELY)
import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children, roles }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  // Check if user exists AND has a token
  if (!user || !user.token) {
    return <Navigate to="/login" replace />;
  }

  // Check role authorization
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;