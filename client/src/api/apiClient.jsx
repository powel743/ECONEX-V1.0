// src/api/apiClient.js
import axios from 'axios';

// If we are in production, use the env variable. If in dev, use localhost.
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const apiClient = axios.create({
  baseURL: baseURL,
});

// 2. Add an Interceptor (this is powerful!)
// This will automatically add the 'Authorization' token
// to EVERY request if the user is logged in.
apiClient.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('econexUser'));
    if (user && user.token) {
      config.headers['Authorization'] = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;