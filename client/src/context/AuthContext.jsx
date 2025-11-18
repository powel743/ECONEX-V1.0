// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { io } from 'socket.io-client';
// --- 1. IMPORT THE API FUNCTIONS ---
import { getLogisticsChatInbox, getCollectorLogisticsInbox, getSalesChatInbox } from '../api/chatApi';

let socket;
const SOCKET_SERVER_URL = 'http://localhost:5001';

export const SocketContext = createContext();
export const AuthContext = createContext();

// Helper function to check for unread messages
const checkUnread = (chat, userId) => {
  if (!chat.messages || !Array.isArray(chat.messages)) return false;
  return chat.messages.some((msg) => {
    const senderId = msg.senderId?._id || msg.senderId;
    return !msg.isRead && senderId.toString() !== userId;
  });
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('econexUser')) || null
  );

  // --- 2. ADD ALL GLOBAL STATE HERE ---
  const [isConnected, setIsConnected] = useState(false);
  
  // Job/Request State (for Collector)
  const [pendingRequests, setPendingRequests] = useState([]);
  
  // Inbox State (GLOBAL)
  const [logisticsInbox, setLogisticsInbox] = useState([]); // For User AND Collector
  const [salesInbox, setSalesInbox] = useState([]); // For Buyer AND Collector

  // Notification State
  const [newRequest, setNewRequest] = useState(null);
  const [newLogisticsMessage, setNewLogisticsMessage] = useState(null);
  const [newSalesMessage, setNewSalesMessage] = useState(null);
  const [newSalesInquiry, setNewSalesInquiry] = useState(null);


  // --- 3. THIS useEffect NOW FETCHES ALL DATA ON LOGIN ---
  useEffect(() => {
    if (user) {
      // Connect to socket
      if (!socket) {
        socket = io(SOCKET_SERVER_URL);
        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));
        
        // --- LISTENERS (These just set notifications) ---
        socket.on('collector:new_request', (data) => setNewRequest(data));
        socket.on('chat:new_logistics_message', (data) => setNewLogisticsMessage(data));
        socket.on('chat:new_sales_message', (data) => setNewSalesMessage(data));
        socket.on('chat:new_sales_inquiry', (data) => setNewSalesInquiry(data));
      }
      socket.emit('user:go_online', user._id);

      // --- FETCH ALL DATA BASED ON ROLE ---
      const fetchInboxesAndData = async () => {
        try {
          if (user.role === 'user') {
            const inboxData = await getLogisticsChatInbox();
            setLogisticsInbox(inboxData.map(chat => ({
              ...chat,
              hasUnread: checkUnread(chat, user._id)
            })));
          }
          if (user.role === 'collector') {
            const [logisticsData, salesData] = await Promise.all([
              getCollectorLogisticsInbox(),
              getSalesChatInbox()
            ]);
            setLogisticsInbox(logisticsData.map(chat => ({
              ...chat,
              hasUnread: checkUnread(chat, user._id)
            })));
            setSalesInbox(salesData.map(chat => ({
              ...chat,
              hasUnread: checkUnread(chat, user._id)
            })));
          }
          // (We can add Buyer logic here too if needed)
        } catch (err) {
          console.error("Failed to fetch inboxes:", err);
        }
      };
      fetchInboxesAndData();

    } else {
      // User logged out, disconnect
      if (socket) {
        socket.disconnect();
        socket = null;
        setIsConnected(false);
      }
    }
    // Cleanup
    return () => {
      if (socket) {
        socket.off('connect');
        socket.off('disconnect');
        socket.off('collector:new_request');
        socket.off('chat:new_logistics_message');
        socket.off('chat:new_sales_message');
        socket.off('chat:new_sales_inquiry');
      }
    };
  }, [user]); // This effect re-runs whenever 'user' (login/logout) changes

  // --- 4. HANDLE REAL-TIME NOTIFICATIONS GLOBALLY ---
  
  // New pickup request
  useEffect(() => {
    if (newRequest && user?.role === 'collector') {
      setPendingRequests(prev => [newRequest, ...prev]);
      alert('New Request Received!');
      setNewRequest(null); // Consume the notification
    }
  }, [newRequest, user?.role]);

  // New logistics message
  useEffect(() => {
    if (newLogisticsMessage) {
      setLogisticsInbox(prev => 
        prev.map(chat => 
          // Find the right chat and add the unread flag
          chat.requestId._id === newLogisticsMessage.requestId
          ? { ...chat, hasUnread: true, messages: [...chat.messages, newLogisticsMessage] }
          : chat
        )
      );
      // We no longer alert here, the dashboard will see "hasUnread" and show the UI
      setNewLogisticsMessage(null); // Consume
    }
  }, [newLogisticsMessage]);

  // New sales inquiry
  useEffect(() => {
    if (newSalesInquiry && user?.role === 'collector') {
      setSalesInbox(prev => [
        { ...newSalesInquiry, hasUnread: true },
        ...prev.filter(c => c._id !== newSalesInquiry._id)
      ]);
      alert('New Sales Inquiry!');
      setNewSalesInquiry(null); // Consume
    }
  }, [newSalesInquiry, user?.role]);

  // New sales message
  useEffect(() => {
    if (newSalesMessage) {
      setSalesInbox(prev => 
        prev.map(chat => 
          chat._id === newSalesMessage.salesChatId
          ? { ...chat, hasUnread: true, messages: [...chat.messages, newSalesMessage] }
          : chat
        )
      );
      // We no longer alert here, the dashboard will see "hasUnread"
      setNewSalesMessage(null); // Consume
    }
  }, [newSalesMessage]);


  // --- (Login/Logout functions are unchanged) ---
  const login = (userData) => {
    localStorage.setItem('econexUser', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('econexUser');
    setUser(null);
    // Clear all state
    setLogisticsInbox([]);
    setSalesInbox([]);
    setPendingRequests([]);
  };

  // --- (Socket Emitters are unchanged) ---
  const updateCollectorLocation = useCallback((location) => {
    if (socket && user) socket.emit('collector:update_location', { userId: user._id, location });
  }, [user]);

  const joinLogisticsRoom = useCallback((requestId) => {
    if (socket) socket.emit('chat:join_logistics_room', requestId);
  }, []);

  const sendLogisticsMessage = useCallback((data) => {
    if (socket) socket.emit('chat:send_logistics_message', data);
  }, []);

  const joinSalesRoom = useCallback((salesChatId) => {
    if (socket) socket.emit('chat:join_sales_room', salesChatId);
  }, []);

  const sendSalesMessage = useCallback((data) => {
    if (socket) socket.emit('chat:send_sales_message', data);
  }, []);


  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <SocketContext.Provider
        value={{
          isConnected,
          // State (We now pass the state and the setter)
          logisticsInbox,
          setLogisticsInbox,
          salesInbox,
          setSalesInbox,
          pendingRequests,
          setPendingRequests,
          
          // Emitters
          updateCollectorLocation,
          joinLogisticsRoom,
          sendLogisticsMessage,
          joinSalesRoom,
          sendSalesMessage,
        }}
      >
        {children}
      </SocketContext.Provider>
    </AuthContext.Provider>
  );
};