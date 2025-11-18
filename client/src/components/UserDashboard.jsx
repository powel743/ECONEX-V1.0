import React, { useState, useEffect } from 'react';
import { createWasteRequest, getUserRequests } from '../api/wasteApi';
import { getLogisticsChatInbox, markLogisticsChatAsRead } from '../api/chatApi';
import { Link } from 'react-router-dom';
import LogisticsChatModal from './LogisticsChatModal';
import { useSocket } from '../hooks/useSocket';
import { useAuth } from '../hooks/useAuth';

// Helper function to check for unread messages
const checkUnread = (chat, userId) => {
  if (!chat.messages || !Array.isArray(chat.messages)) {
    return false; // Safety check
  }
  return chat.messages.some((msg) => {
    const senderId = msg.senderId?._id || msg.senderId;
    return !msg.isRead && senderId.toString() !== userId;
  });
};


function UserDashboard() {
  const [type, setType] = useState('lightweight');
  const [weight, setWeight] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [logisticsInbox, setLogisticsInbox] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  const { user } = useAuth();
  // --- 1. REMOVE clearNewLogisticsMessage ---
  const { newLogisticsMessage } = useSocket();

  // --- 2. THIS IS THE FIX ---
  useEffect(() => {
    if (newLogisticsMessage && newLogisticsMessage.senderRole === 'collector') {
      if (!activeChat || activeChat !== newLogisticsMessage.requestId) {
        // alert('New message from your Collector!'); // Optional alert
        setLogisticsInbox(prev => 
          prev.map(chat => 
            chat.requestId._id === newLogisticsMessage.requestId 
            ? { ...chat, hasUnread: true } 
            : chat
          )
        );
        // --- DO NOT CLEAR THE MESSAGE HERE ---
        // clearNewLogisticsMessage(); // <-- REMOVED
      }
    }
  }, [newLogisticsMessage, activeChat]); // <-- REMOVED clearNewLogisticsMessage


  // --- (useEffect for fetching inbox is unchanged) ---
  useEffect(() => {
    if (!user?._id) return;
    
    const fetchInbox = async () => {
      try {
        const inboxData = await getLogisticsChatInbox();
        const inboxWithUnread = inboxData.map(chat => ({
          ...chat,
          hasUnread: checkUnread(chat, user._id)
        }));
        setLogisticsInbox(inboxWithUnread);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchInbox();
  }, [success, user?._id]);


  // --- (handleSubmit is unchanged) ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setIsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        try {
          const requestData = { type, weight: Number(weight), location };
          await createWasteRequest(requestData);
          setSuccess('Pickup request submitted! A collector will be notified.');
          setWeight('');
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      },
      () => {
        setError('Unable to retrieve location. Please enable location services.');
        setIsLoading(false);
      }
    );
  };
  
  // --- (handleOpenChat is unchanged) ---
  const handleOpenChat = async (chat) => {
    if (chat.hasUnread) {
      try {
        await markLogisticsChatAsRead(chat._id);
        setLogisticsInbox(prev => 
          prev.map(c => 
            c._id === chat._id ? { ...c, hasUnread: false } : c
          )
        );
      } catch (err) {
        console.error("Failed to mark chat as read:", err);
      }
    }
    setActiveChat(chat.requestId._id);
  };

  return (
    <div className="space-y-8">
      
      {/* --- 1. GAMIFIED REWARDS BANNER --- */}
      <div className="bg-linear-to-r from-amber-400 to-orange-500 rounded-2xl shadow-lg p-6 text-white flex flex-col md:flex-row items-center justify-between transform hover:scale-[1.01] transition-transform duration-300">
        <div>
          <h3 className="text-2xl font-bold">🎉 Rewards Marketplace</h3>
          <p className="mt-1 opacity-90">You have points waiting! Redeem them for airtime and vouchers.</p>
        </div>
        <Link 
          to="/rewards" 
          className="mt-4 md:mt-0 bg-white text-orange-600 font-bold py-3 px-6 rounded-full shadow-md hover:bg-gray-50 transition-colors"
        >
          Go to Rewards &rarr;
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* --- 2. REQUEST PICKUP FORM (Left Column) --- */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
            <div className="bg-emerald-600 px-6 py-4">
              <h3 className="text-lg font-semibold text-white flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                New Pickup
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Waste Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                  >
                    <option value="lightweight">Lightweight (10 pts/kg)</option>
                    <option value="heavyweight">Heavyweight (20 pts/kg)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Est. Weight (kg)</label>
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="e.g., 5.5"
                    required
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-emerald-500 focus:ring-emerald-500"
                  />
                </div>
                
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-lg shadow transition-colors flex justify-center items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Locating...
                    </span>
                  ) : 'Request Pickup'}
                </button>
                
                {success && <div className="p-3 bg-green-100 text-green-700 text-sm rounded-lg">{success}</div>}
                {error && <div className="p-3 bg-red-100 text-red-700 text-sm rounded-lg">{error}</div>}
              </form>
            </div>
          </div>
        </div>

        {/* --- 3. MY LOGISTICS INBOX (Right Column) --- */}
        <div className="lg:col-span-2">
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            My Active Requests
            <span className="ml-2 bg-gray-200 text-gray-700 text-sm px-2 py-0.5 rounded-full">{logisticsInbox.length}</span>
          </h3>
          
          {logisticsInbox.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-10 text-center text-gray-500 border-2 border-dashed border-gray-300 flex flex-col items-center">
              <svg className="w-12 h-12 text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
              <p className="font-medium">You have no active requests.</p>
              <p className="text-sm mt-1">Requests you make will appear here once accepted by a collector.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logisticsInbox.map((chat) => (
                <div 
                  key={chat._id} 
                  className={`bg-white rounded-xl shadow-sm border p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center transition-all duration-200 ${chat.hasUnread ? 'border-l-4 border-l-red-500 bg-red-50 ring-1 ring-red-100' : 'border-gray-100 hover:shadow-md'}`}
                >
                  <div className="mb-4 sm:mb-0">
                    <div className="flex items-center mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${chat.requestId.status === 'accepted' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {chat.requestId.status}
                      </span>
                      {chat.hasUnread && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-600 animate-pulse">
                          ● New Message
                        </span>
                      )}
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 flex items-center">
                      {/* Conditional Icon based on type */}
                      {chat.requestId.type === 'heavyweight' ? (
                        <span className="mr-2 text-xl">🏋️</span>
                      ) : (
                        <span className="mr-2 text-xl">🪶</span>
                      )}
                      {chat.requestId.type.charAt(0).toUpperCase() + chat.requestId.type.slice(1)} Waste
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">Collector: <span className="font-medium text-gray-900">{chat.collectorId.name}</span></p>
                  </div>
                  
                  <button 
                    onClick={() => handleOpenChat(chat)}
                    className={`w-full sm:w-auto px-5 py-2.5 rounded-lg font-medium shadow-sm transition-all flex items-center justify-center ${
                      chat.hasUnread 
                      ? 'bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-300' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
                    {chat.hasUnread ? 'Read Message' : 'Open Chat'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {activeChat && (
        <LogisticsChatModal 
          requestId={activeChat} 
          onClose={() => setActiveChat(null)} 
        />
      )}
    </div>
  );
}

export default UserDashboard;