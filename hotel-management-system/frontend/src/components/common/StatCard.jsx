// frontend/src/components/Common/StatCard.jsx
import React from 'react';
import { Card } from 'react-bootstrap';
import { motion } from 'framer-motion';
import './StatCard.css';

const StatCard = ({ title, value, subtitle, icon, color = 'primary', delay = 0 }) => {
  const colors = {
    primary: { bg: '#4a6cf7', light: '#eef1ff' },
    success: { bg: '#10b981', light: '#ecfdf5' },
    warning: { bg: '#f59e0b', light: '#fffbeb' },
    danger: { bg: '#ef4444', light: '#fef2f2' },
    info: { bg: '#06b6d4', light: '#ecfeff' },
  };

  const c = colors[color] || colors.primary;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="stat-card-modern">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <p className="stat-label">{title}</p>
              <h3 className="stat-value">{value}</h3>
              {subtitle && <small className="stat-subtitle">{subtitle}</small>}
            </div>
            <div className="stat-icon-modern" style={{ background: c.light, color: c.bg }}>
              {icon}
            </div>
          </div>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default StatCard;