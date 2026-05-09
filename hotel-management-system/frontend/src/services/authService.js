// frontend/src/services/authService.js
import { API_BASE_URL } from './config';

const authService = {
  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      if (data.token) {
        localStorage.setItem('user', JSON.stringify({
          ...data.user,
          token: data.token
        }));
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      if (data.token) {
        localStorage.setItem('user', JSON.stringify({
          ...data.user,
          token: data.token
        }));
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  async getProfile() {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch profile');
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser() {
    return JSON.parse(localStorage.getItem('user'));
  },

  isAuthenticated() {
    const user = this.getCurrentUser();
    return !!user?.token;
  }
};

export default authService;