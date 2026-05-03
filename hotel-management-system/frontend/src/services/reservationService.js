// frontend/src/services/reservationService.js
import { API_BASE_URL } from './config';
import authService from './authService';

const reservationService = {
  async getReservations(params = {}) {
    try {
      const user = authService.getCurrentUser();
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/reservations?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch reservations');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  async getReservation(id) {
    try {
      const user = authService.getCurrentUser();
      const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch reservation');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  async createReservation(reservationData) {
    try {
      const user = authService.getCurrentUser();
      const response = await fetch(`${API_BASE_URL}/reservations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(reservationData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create reservation');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  async updateReservation(id, reservationData) {
    try {
      const user = authService.getCurrentUser();
      const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(reservationData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update reservation');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  async deleteReservation(id) {
    try {
      const user = authService.getCurrentUser();
      const response = await fetch(`${API_BASE_URL}/reservations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete reservation');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  async checkIn(id) {
    try {
      const user = authService.getCurrentUser();
      const response = await fetch(`${API_BASE_URL}/reservations/${id}/checkin`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to check in');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  async checkOut(id) {
    try {
      const user = authService.getCurrentUser();
      const response = await fetch(`${API_BASE_URL}/reservations/${id}/checkout`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to check out');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }
};

export default reservationService;