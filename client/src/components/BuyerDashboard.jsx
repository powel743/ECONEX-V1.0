// src/components/BuyerDashboard.jsx
import React, { useState, useEffect } from 'react';
import { getListings, purchaseListing } from '../api/buyerApi';
// --- 1. IMPORT CHAT FUNCTIONS ---
import { initiateSalesChat } from '../api/chatApi';
import SalesChatModal from './SalesChatModal';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';

function BuyerDashboard() {
  const { user } = useAuth();
  // --- 3. GET SOCKET DATA ---
  const { newSalesMessage, clearNewSalesMessage } = useSocket(user?._id);

  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // This will hold the *entire* chat object returned from the API
  const [activeSalesChat, setActiveSalesChat] = useState(null);

  // 1. Fetch all listings on component mount
  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await getListings();
        setListings(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchListings();
  }, []);

  // --- 4. ADD useEffect TO LISTEN FOR REPLIES ---
  useEffect(() => {
    if (newSalesMessage && newSalesMessage.senderRole === 'collector') {
      // Check if the chat window is NOT open
      if (!activeSalesChat || activeSalesChat._id !== newSalesMessage.salesChatId) {
        alert('New message from a Collector!');
        clearNewSalesMessage();
      }
    }
  }, [newSalesMessage, clearNewSalesMessage, activeSalesChat]);


  // 2. Handle the purchase
  const handlePurchase = async (listingId) => {
    setError(null);
    setMessage(null);

    // Add a simple confirmation
    if (!window.confirm('Are you sure you want to purchase this item?')) {
      return;
    }

    try {
      const transaction = await purchaseListing(listingId);

      // Show a success message
      setMessage(
        `Purchase successful! Total charged: KSh ${transaction.totalChargedToBuyer.toFixed(
          2
        )}`
      );

      // 3. Remove the purchased item from the list
      setListings((prev) => prev.filter((item) => item._id !== listingId));
    } catch (err) {
      setError(err.message);
    }
  };

  // --- 3. ADD NEW FUNCTION TO OPEN CHAT ---
  const handleOpenChat = async (requestId) => {
    setError(null);
    try {
      // This API call finds or creates the chat and returns it
      const chatData = await initiateSalesChat(requestId);
      setActiveSalesChat(chatData);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h3 className="text-3xl font-bold text-slate-900">Marketplace Listings</h3>
        <p className="text-slate-500 mt-2">Browse and purchase recyclable waste directly from collectors.</p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded shadow-sm flex items-center animate-fade-in">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          {message}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded shadow-sm flex items-center animate-fade-in">
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          {error}
        </div>
      )}

      {listings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No listings found</h3>
          <p className="mt-1 text-sm text-gray-500">No items are currently listed for sale. Check back later!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((item) => (
            <div 
              key={item._id} 
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col"
            >
              {/* Header Color Stripe */}
              <div className={`h-2 w-full ${item.type === 'heavyweight' ? 'bg-blue-600' : 'bg-emerald-500'}`}></div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-lg font-bold text-gray-900 capitalize flex items-center">
                    {item.type === 'heavyweight' ? '🏋️' : '🪶'} {item.type}
                  </h4>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                    {item.weight} kg
                  </span>
                </div>

                <div className="space-y-3 mb-6 flex-1">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-700">Collector:</span> {item.collectorId.name}
                  </p>
                  
                  {item.listingDescription && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                      "{item.listingDescription}"
                    </div>
                  )}
                </div>

                <div className="space-y-3 mt-auto">
                  <button
                    onClick={() => handlePurchase(item._id)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-lg shadow-sm transition-colors flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
                    Purchase Item
                  </button>

                  <button
                    onClick={() => handleOpenChat(item._id)}
                    className="w-full bg-white border border-amber-500 text-amber-600 hover:bg-amber-50 font-semibold py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                    Ask Question
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- 5. RENDER THE CHAT MODAL --- */}
      {activeSalesChat && (
        <SalesChatModal 
          chat={activeSalesChat}
          onClose={() => setActiveSalesChat(null)}
        />
      )}
    </div>
  );
}

export default BuyerDashboard;