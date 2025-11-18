// src/api/rewardsApi.js
import apiClient from './apiClient';

/**
 * @desc    Fetch all active offers
 * @route   GET /api/rewards/offers
 */
export const getAvailableOffers = async () => {
  try {
    const response = await apiClient.get('/rewards/offers');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch offers');
  }
};

/**
 * @desc    Fetch all vouchers owned by the user
 * @route   GET /api/rewards/my-vouchers
 */
export const getMyVouchers = async () => {
  try {
    const response = await apiClient.get('/rewards/my-vouchers');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch vouchers');
  }
};

/**
 * @desc    Redeem an offer
 * @route   POST /api/rewards/redeem/:id
 */
export const redeemOffer = async (offerId) => {
  try {
    const response = await apiClient.post(`/rewards/redeem/${offerId}`);
    return response.data; // Returns the new UserRedemption voucher
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Redemption failed');
  }
};