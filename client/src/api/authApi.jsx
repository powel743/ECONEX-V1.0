// src/api/authApi.js
import apiClient from './apiClient';

export const register = async (userData) => {
  try {
    const response = await apiClient.post('/users/register', userData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Registration failed');
  }
};

// --- NEW FUNCTION TO ADD ---
export const login = async (credentials) => {
  try {
    // Our backend route is POST /api/users/login
    const response = await apiClient.post('/users/login', credentials);
    return response.data; // This will be the { user, token } object
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Login failed');
  }
};