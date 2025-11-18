// src/api/apiClient.js
import axios from 'axios';

// 1. Set the base URL for our API
const apiClient = axios.create({
  baseURL: 'http://localhost:5001/api', // Our backend server
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