// frontend/src/services/userService.js
import { API_BASE_URL } from './config';
import authService from './authService';

const userService = {
  async getUsers(params = {}) {
    try {
      const user = authService.getCurrentUser();
      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${API_BASE_URL}/users?${queryString}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  async getUser(id) {
    try {
      const user = authService.getCurrentUser();
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch user');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  async createUser(userData) {
    try {
      const currentUser = authService.getCurrentUser();
      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create user');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  async updateUser(id, userData) {
    try {
      const currentUser = authService.getCurrentUser();
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser?.token}`
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  async deleteUser(id) {
    try {
      const currentUser = authService.getCurrentUser();
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${currentUser?.token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete user');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  }
};

export default userService;