// frontend/src/services/roomService.js
import { API_BASE_URL } from './config';
import authService from './authService';

const roomService = {
  async getRooms(params = {}) {
    try {
      const user = authService.getCurrentUser();
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/rooms?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch rooms');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  async getRoom(id) {
    try {
      const user = authService.getCurrentUser();
      const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch room');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  async createRoom(roomData) {
    try {
      const user = authService.getCurrentUser();
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(roomData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create room');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  async updateRoom(id, roomData) {
    try {
      const user = authService.getCurrentUser();
      const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify(roomData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update room');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  async deleteRoom(id) {
    try {
      const user = authService.getCurrentUser();
      const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete room');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  async updateRoomStatus(id, status) {
    try {
      const user = authService.getCurrentUser();
      const response = await fetch(`${API_BASE_URL}/rooms/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ status })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update room status');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  async getRoomStats() {
    try {
      const user = authService.getCurrentUser();
      const response = await fetch(`${API_BASE_URL}/rooms/stats`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch room stats');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }
};

export default roomService;