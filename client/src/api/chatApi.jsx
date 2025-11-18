// client/src/api/chatApi.js
import apiClient from './apiClient';

// --- LOGISTICS CHAT (User <-> Collector) ---
export const getLogisticsChat = async (requestId) => {
  try {
    const response = await apiClient.get(`/chat/logistics/${requestId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get chat history');
  }
};

export const getLogisticsChatInbox = async () => {
  try {
    const response = await apiClient.get('/chat/logistics/inbox');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get user inbox');
  }
};

// --- THIS IS THE NEW FUNCTION ---
export const getCollectorLogisticsInbox = async () => {
  try {
    const response = await apiClient.get('/chat/logistics/inbox/collector');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get collector inbox');
  }
};

export const markLogisticsChatAsRead = async (chatId) => {
  try {
    await apiClient.put(`/chat/logistics/read/${chatId}`);
  } catch (error) {
    console.error("Failed to mark logistics chat as read", error);
  }
};

// --- SALES CHAT (Buyer <-> Collector) ---
export const initiateSalesChat = async (requestId) => {
  try {
    const response = await apiClient.post(`/chat/sales/inquire/${requestId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to start inquiry');
  }
};

export const getSalesChatInbox = async () => {
  try {
    const response = await apiClient.get('/chat/sales/inbox');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to get sales inbox');
  }
};

export const markSalesChatAsRead = async (chatId) => {
  try {
    await apiClient.put(`/sales/read/${chatId}`);
  } catch (error) {
    console.error("Failed to mark sales chat as read", error);
  }
};