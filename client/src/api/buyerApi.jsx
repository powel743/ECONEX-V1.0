// src/api/buyerApi.js
import apiClient from './apiClient';

export const getListings = async () => {
  try {
    const response = await apiClient.get('/buyer/listings');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch listings');
  }
};

export const purchaseListing = async (listingId) => {
  try {
    const response = await apiClient.post(`/buyer/purchase/${listingId}`);
    return response.data; // This will return the transaction details
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Purchase failed');
  }
};