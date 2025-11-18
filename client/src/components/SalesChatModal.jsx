// src/components/SalesChatModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useSocket } from '../hooks/useSocket';

function SalesChatModal({ chat, onClose }) {
  const { user } = useAuth();
  const {
    newSalesMessage,
    clearNewSalesMessage,
    joinSalesRoom,
    sendSalesMessage,
  } = useSocket(user?._id);

  const [messages, setMessages] = useState(chat.messages || []);
  const [messageInput, setMessageInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    joinSalesRoom(chat._id);
  }, [chat._id]);

  useEffect(() => {
    if (newSalesMessage) {
      setMessages((prev) => [...prev, newSalesMessage]);
      clearNewSalesMessage();
    }
  }, [newSalesMessage, clearNewSalesMessage]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (messageInput.trim() === '') return;
    sendSalesMessage({
      salesChatId: chat._id,
      senderId: user._id,
      senderRole: user.role,
      message: messageInput,
    });
    setMessageInput('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh]">
        
        {/* --- Header --- */}
        <div className="bg-purple-600 p-4 flex justify-between items-center shadow-md z-10">
          <div className="flex items-center space-x-3">
            <div className="bg-purple-500/30 p-1.5 rounded-lg">
              {/* Shopping Bag Icon */}
              <svg className="w-5 h-5 text-purple-100" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">Sales Inquiry</h3>
              <p className="text-purple-200 text-xs">Discuss listing details</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-purple-100 hover:text-white hover:bg-purple-700/50 rounded-full p-2 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* --- Messages Area --- */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 scroll-smooth">
          {messages.length === 0 && (
             <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
              <svg className="w-12 h-12 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
              <p className="text-sm">Ask a question to start the chat.</p>
            </div>
          )}

          {messages.map((msg, index) => {
            const isMe = msg.senderId?._id === user._id || msg.senderId === user._id;
            return (
              <div key={index} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                    isMe 
                    ? 'bg-purple-600 text-white rounded-br-sm' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-bl-sm'
                  }`}
                >
                  {!isMe && (
                    <p className="text-xs font-bold text-purple-600 mb-1 capitalize">
                      {msg.senderRole}
                    </p>
                  )}
                  <p className="leading-relaxed">{msg.message}</p>
                </div>
                 <span className="text-[10px] text-gray-400 mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        {/* --- Input Area --- */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleSend} className="flex gap-2 items-center">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-gray-300 rounded-full px-5 py-3 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all text-sm"
            />
            <button 
              type="submit" 
              disabled={!messageInput.trim()}
              className="bg-purple-600 text-white rounded-full p-3 hover:bg-purple-700 disabled:opacity-50 disabled:hover:bg-purple-600 transition-colors shadow-md shrink-0"
            >
              <svg className="w-5 h-5 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default SalesChatModal;