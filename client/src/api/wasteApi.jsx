// src/api/wasteApi.js
import apiClient from './apiClient';

/**
 * @desc    Submit a new waste pickup request
 * @route   POST /api/waste/request
 */
export const createWasteRequest = async (requestData) => {
  try {
    // requestData will be { type, weight, location }
    const response = await apiClient.post('/waste/request', requestData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create request');
  }
};

/**
 * @desc    Get all pending requests
 * @route   GET /api/waste/collector/requests
 */
export const getPendingRequests = async () => {
  try {
    const response = await apiClient.get('/waste/collector/requests');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch requests');
  }
};

/**
 * @desc    Accept a request
 *_@route   PUT /api/waste/accept/:id
 */
export const acceptRequest = async (requestId) => {
  try {
    const response = await apiClient.put(`/waste/accept/${requestId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to accept request');
  }
};

/**
 * @desc    Complete a collection
 * @route   PUT /api/waste/collect/:id
 */
export const collectRequest = async (requestId, actualWeight) => {
  try {
    const response = await apiClient.put(`/waste/collect/${requestId}`, {
      actualWeight,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to complete collection');
  }
};

/**
 * @desc    List a collected item for sale
 * @route   PUT /api/waste/list/:id
 */
export const listForSale = async (requestId, description) => { //  ACCEPT DESCRIPTION
  try {
    // 2. SEND IT IN THE BODY
    const response = await apiClient.put(`/waste/list/${requestId}`, {
      description,
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to list item');
  }
};

/**
 * @desc    Get all active requests for the logged-in user
 * @route   GET /api/waste/user/requests
 */
export const getUserRequests = async () => {
  try {
    const response = await apiClient.get('/waste/user/requests');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch user requests');
  }
};

/**
 * @desc    Get all accepted requests for the collector
 * @route   GET /api/waste/collector/accepted
 */
export const getAcceptedRequests = async () => {
  try {
    const response = await apiClient.get('/waste/collector/accepted');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch accepted requests');
  }
};