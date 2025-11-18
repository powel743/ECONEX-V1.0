// src/api/adminApi.js
import apiClient from './apiClient';

/**
 * @desc    Set or update the market price
 * @route   POST /api/admin/price
 */
export const setMarketPrice = async (priceData) => {
  try {
    const response = await apiClient.post('/admin/price', priceData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to set price');
  }
};

/**
 * @desc    Create a new discount offer
 * @route   POST /api/admin/offers
 */
export const createDiscountOffer = async (offerData) => {
  try {
    const response = await apiClient.post('/admin/offers', offerData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to create offer');
  }
};