// client/src/components/CollectorDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';
import {
  getPendingRequests,
  acceptRequest,
  collectRequest,
  listForSale,
  getAcceptedRequests,
} from '../api/wasteApi';
import {
  getSalesChatInbox,
  getCollectorLogisticsInbox,
  markLogisticsChatAsRead,
  markSalesChatAsRead,
} from '../api/chatApi';
import LogisticsChatModal from './LogisticsChatModal';
import SalesChatModal from './SalesChatModal';
import WasteMap from './WasteMap';

// Helper function to check for unread messages
const checkUnread = (chat, userId) => {
  if (!chat.messages || !Array.isArray(chat.messages)) {
    return false;
  }
  return chat.messages.some((msg) => {
    const senderId = msg.senderId?._id || msg.senderId;
    return !msg.isRead && senderId.toString() !== userId;
  });
};

function CollectorDashboard() {
  const { user } = useAuth();
  const {
    isConnected,
    newRequest,
    clearNewRequest,
    updateCollectorLocation,
    newSalesInquiry,
    clearNewSalesInquiry,
    newLogisticsMessage,
    clearNewLogisticsMessage,
    newSalesMessage,
    clearNewSalesMessage,
  } = useSocket(user?._id);

  const [pendingRequests, setPendingRequests] = useState([]);
  const [logisticsInbox, setLogisticsInbox] = useState([]);
  const [completedJobs, setCompletedJobs] = useState([]);
  const [totalKgCollected, setTotalKgCollected] = useState(0);
  const [error, setError] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [salesInbox, setSalesInbox] = useState([]);
  const [activeLogisticsChat, setActiveLogisticsChat] = useState(null);
  const [activeSalesChat, setActiveSalesChat] = useState(null);

  // --- (Fetch data useEffect is unchanged) ---
  useEffect(() => {
    const fetchAllData = async () => {
      if (!user?._id) return;
      try {
        const [pendingData, logisticsData, salesData] = await Promise.all([
          getPendingRequests(),
          getCollectorLogisticsInbox(),
          getSalesChatInbox(),
        ]);
        
        setPendingRequests(pendingData);

        const logisticsWithUnread = logisticsData.map(chat => ({
          ...chat,
          hasUnread: checkUnread(chat, user._id)
        }));
        setLogisticsInbox(logisticsWithUnread);

        const salesWithUnread = salesData.map(chat => ({
          ...chat,
          hasUnread: checkUnread(chat, user._id)
        }));
        setSalesInbox(salesWithUnread);

      } catch (err) {
        setError(err.message);
      }
    };
    
    fetchAllData();
  }, [user?._id]);

  // --- (Socket useEffects are unchanged) ---
  useEffect(() => {
    if (newRequest) {
      setPendingRequests((prev) => [newRequest, ...prev]);
      alert(`New Request Received!`);
      clearNewRequest();
    }
  }, [newRequest, clearNewRequest]);

  useEffect(() => {
    if (newSalesInquiry) {
      alert(`New Sales Inquiry!`);
      setSalesInbox((prev) => [
        { ...newSalesInquiry, hasUnread: true },
        ...prev.filter((c) => c._id !== newSalesInquiry._id),
      ]);
      clearNewSalesInquiry();
    }
  }, [newSalesInquiry, clearNewSalesInquiry]);

  useEffect(() => {
    if (newLogisticsMessage && newLogisticsMessage.senderRole === 'user') {
      if (!activeLogisticsChat || activeLogisticsChat !== newLogisticsMessage.requestId) {
        alert('New message from a User!');
        setLogisticsInbox(prev => 
          prev.map(chat => 
            chat.requestId._id === newLogisticsMessage.requestId 
            ? { ...chat, hasUnread: true } 
            : chat
          )
        );
        clearNewLogisticsMessage();
      }
    }
  }, [newLogisticsMessage, clearNewLogisticsMessage, activeLogisticsChat]);

  useEffect(() => {
    if (newSalesMessage && newSalesMessage.senderRole === 'buyer') {
      if (!activeSalesChat || activeSalesChat._id !== newSalesMessage.salesChatId) {
        alert('New message from a Buyer!');
        setSalesInbox(prev => 
          prev.map(chat => 
            chat._id === newSalesMessage.salesChatId 
            ? { ...chat, hasUnread: true } 
            : chat
          )
        );
        clearNewSalesMessage();
      }
    }
  }, [newSalesMessage, clearNewSalesMessage, activeSalesChat]);

  useEffect(() => {
    let watchId;
    if (navigator.geolocation) {
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const location = { latitude, longitude };
          setCurrentPosition(location);
          updateCollectorLocation(location);
        },
        (err) => { console.error('Error watching position:', err); },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    }
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, [updateCollectorLocation]);

  // --- (Handlers are unchanged) ---
  const handleAccept = async (requestId) => {
    try {
      await acceptRequest(requestId);
      const [pendingData, logisticsData] = await Promise.all([
        getPendingRequests(),
        getCollectorLogisticsInbox(),
      ]);
      setPendingRequests(pendingData);
      const logisticsWithUnread = logisticsData.map(chat => ({
        ...chat,
        hasUnread: checkUnread(chat, user._id)
      }));
      setLogisticsInbox(logisticsWithUnread);
    } catch (err) { setError(err.message); }
  };

  const handleComplete = async (chat) => {
    const requestId = chat.requestId._id;
    const actualWeight = prompt('Enter the ACTUAL weight collected (in kg):');
    if (!actualWeight || isNaN(actualWeight) || actualWeight <= 0) {
      alert('Please enter a valid weight.');
      return;
    }
    const weight = Number(actualWeight);
    try {
      const completedJob = await collectRequest(requestId, weight);
      setCompletedJobs((prev) => [completedJob, ...prev]);
      setTotalKgCollected((prevKg) => prevKg + weight);
      setLogisticsInbox((prev) => prev.filter((c) => c._id !== chat._id));
      alert('Collection complete! The user has received their points.');
    } catch (err) { setError(err.message); }
  };

  const handleList = async (job) => {
    const description = prompt('Enter a brief description for the marketplace listing (e.g., "Clean, sorted plastic bottles"):');
    if (description === null) return;
    try {
      await listForSale(job._id, description);
      setCompletedJobs((prev) =>
        prev.map((j) => j._id === job._id ? { ...j, status: 'listed_for_sale', listingDescription: description } : j)
      );
      alert('Item is now listed on the marketplace!');
    } catch (err) { setError(err.message); }
  };
  
  const handleOpenLogisticsChat = async (chat) => {
    if (chat.hasUnread) {
      try {
        await markLogisticsChatAsRead(chat._id);
        setLogisticsInbox(prev => prev.map(c => c._id === chat._id ? { ...c, hasUnread: false } : c));
      } catch (err) { console.error(err); }
    }
    setActiveLogisticsChat(chat.requestId._id);
  };
  
  const handleOpenSalesChat = async (chat) => {
    if (chat.hasUnread) {
      try {
        await markSalesChatAsRead(chat._id);
        setSalesInbox(prev => prev.map(c => c._id === chat._id ? { ...c, hasUnread: false } : c));
      } catch (err) { console.error(err); }
    }
    setActiveSalesChat(chat);
  };

  // --- RENDER ---
  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* --- 1. TOP ROW: STATUS & MAP --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Card */}
        <div className="bg-linear-to-br from-emerald-700 to-emerald-900 rounded-xl shadow-lg p-6 text-white flex flex-col justify-between transform hover:scale-[1.02] transition-transform">
          <div>
            <div className="flex items-center justify-between">
               <p className="text-emerald-200 text-xs font-bold uppercase tracking-wider">System Status</p>
               {isConnected ? (
                 <span className="flex h-3 w-3">
                   <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-green-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                 </span>
               ) : (
                 <span className="h-3 w-3 rounded-full bg-red-500"></span>
               )}
            </div>
            <div className="mt-2">
              <span className="text-xl font-bold tracking-tight">{isConnected ? 'Online & Tracking' : 'Disconnected'}</span>
            </div>
          </div>
          <div className="mt-6 border-t border-emerald-600 pt-4">
            <p className="text-emerald-200 text-xs font-bold uppercase tracking-wider">Total Collected Today</p>
            <p className="text-4xl font-extrabold mt-1">{totalKgCollected.toFixed(2)} <span className="text-lg font-normal text-emerald-300">kg</span></p>
          </div>
        </div>

        {/* Map */}
        <div className="lg:col-span-2 bg-white p-1 rounded-xl shadow-lg border border-gray-200 h-64 lg:h-auto relative overflow-hidden">
          <WasteMap requests={pendingRequests} collectorPosition={currentPosition} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* --- 2. SALES INBOX (Purple Theme) --- */}
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <span className="bg-purple-100 text-purple-800 p-2 rounded-lg mr-3 text-sm">💬</span>
            Sales Inquiries
            <span className="ml-2 bg-gray-100 text-gray-600 text-sm px-2 py-0.5 rounded-full">{salesInbox.length}</span>
          </h3>
          
          {salesInbox.length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
              <p>No sales inquiries yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {salesInbox.map((chat) => (
                <div key={chat._id} className={`bg-white rounded-lg p-4 border shadow-sm transition-colors ${chat.hasUnread ? 'border-purple-500 bg-purple-50' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="text-sm text-gray-500">Buyer</p>
                      <p className="font-bold text-gray-900">{chat.buyerId.name}</p>
                    </div>
                    {chat.hasUnread && <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full animate-pulse">New Message</span>}
                  </div>
                  <p className="text-xs text-gray-500 mb-3 truncate">
                    Listing: {chat.requestId?.listingDescription || '...'}
                  </p>
                  <button 
                    onClick={() => handleOpenSalesChat(chat)}
                    className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold rounded-md transition-colors"
                  >
                    Open Chat
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- 3. MY ACTIVE JOBS (Blue Theme) --- */}
        <div>
          <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
            <span className="bg-blue-100 text-blue-800 p-2 rounded-lg mr-3 text-sm">🚚</span>
            My Active Jobs
            <span className="ml-2 bg-gray-100 text-gray-600 text-sm px-2 py-0.5 rounded-full">
              {logisticsInbox.filter(chat => chat.requestId.status === 'accepted').length}
            </span>
          </h3>

          {logisticsInbox.filter(chat => chat.requestId.status === 'accepted').length === 0 ? (
            <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
              <p>No active jobs.</p>
              <p className="text-sm mt-1">Accept requests from the list below to start working.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {logisticsInbox
                .filter(chat => chat.requestId.status === 'accepted')
                .map((chat) => (
                  <div key={chat._id} className={`bg-white rounded-lg p-5 border shadow-sm transition-all ${chat.hasUnread ? 'border-l-4 border-l-red-500 bg-red-50' : 'border-gray-200 hover:border-blue-300'}`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <div>
                        <p className="font-bold text-gray-900">{chat.userId.name}</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wide">Status: {chat.requestId.status}</p>
                      </div>
                      {chat.hasUnread && <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full animate-pulse">New Message</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => handleOpenLogisticsChat(chat)}
                        className="py-2 px-3 bg-blue-100 text-blue-700 hover:bg-blue-200 font-semibold rounded text-sm flex items-center justify-center"
                      >
                        Chat w/ User
                      </button>
                      <button 
                        onClick={() => handleComplete(chat)}
                        className="py-2 px-3 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded text-sm shadow-sm"
                      >
                        Complete
                      </button>
                    </div>
                  </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- 4. PENDING REQUESTS (Green Theme) --- */}
      <div className="border-t border-gray-200 pt-8">
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
           <span className="bg-emerald-100 text-emerald-800 p-2 rounded-lg mr-3 text-sm">📍</span>
           Nearby Requests
           <span className="ml-2 bg-gray-100 text-gray-600 text-sm px-2 py-0.5 rounded-full">{pendingRequests.length}</span>
        </h3>
        
        {pendingRequests.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
            <p>No pending requests nearby.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingRequests.map((req) => (
              <div key={req._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-200">
                <div className="flex justify-between items-start mb-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${req.type === 'heavyweight' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                    {req.type === 'heavyweight' ? '🏋️' : '🪶'} {req.type}
                  </span>
                  <span className="text-lg font-bold text-gray-700">{req.weight} kg</span>
                </div>
                <button 
                  onClick={() => handleAccept(req._id)}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-sm flex items-center justify-center"
                >
                  Accept Job
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- 5. COMPLETED JOBS (History) --- */}
      <div className="border-t border-gray-200 pt-8 pb-10">
        <h3 className="text-xl font-bold text-slate-800 mb-4 text-opacity-75">History & Inventory</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {completedJobs.map((job) => (
            <div key={job._id} className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col justify-between opacity-90 hover:opacity-100 transition-opacity">
              <div>
                <div className="flex justify-between mb-2">
                  <p className="font-bold text-slate-700 capitalize">{job.type}</p>
                  <p className="text-slate-600 font-mono">{job.weight} kg</p>
                </div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Status: {job.status}</p>
              </div>
              
              {job.status === 'collected' ? (
                <button 
                  onClick={() => handleList(job)}
                  className="mt-4 w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors text-sm shadow-sm"
                >
                  List for Sale
                </button>
              ) : (
                <div className="mt-4 py-2 text-center text-emerald-600 font-bold text-sm bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Listed
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* --- Modals (unchanged) --- */}
      {activeLogisticsChat && (
        <LogisticsChatModal 
          requestId={activeLogisticsChat} 
          onClose={() => setActiveLogisticsChat(null)} 
        />
      )}

      {activeSalesChat && (
        <SalesChatModal 
          chat={activeSalesChat} 
          onClose={() => setActiveSalesChat(null)} 
        />
      )}
    </div>
  );
}

export default CollectorDashboard;