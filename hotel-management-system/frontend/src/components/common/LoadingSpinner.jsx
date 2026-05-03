// src/components/Common/LoadingSpinner.js
import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-spinner-container">
      <Spinner animation="border" variant="primary" />
      <p className="mt-2 text-muted">{message}</p>
    </div>
  );
};

export default LoadingSpinner;