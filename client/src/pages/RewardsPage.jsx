// client/src/pages/RewardsPage.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getAvailableOffers, getMyVouchers, redeemOffer } from '../api/rewardsApi';
import { Link } from 'react-router-dom';

function RewardsPage() {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [myVouchers, setMyVouchers] = useState([]);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  
  // Note: user.points from AuthContext might be stale.
  const [currentPoints, setCurrentPoints] = useState(user?.points || 0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [offersData, vouchersData] = await Promise.all([
          getAvailableOffers(),
          getMyVouchers(),
        ]);
        setOffers(offersData);
        setMyVouchers(vouchersData);
      } catch (err) {
        setError(err.message);
      }
    };
    loadData();
  }, []);

  const handleRedeem = async (offer) => {
    setError(null);
    setMessage(null);
    
    if (currentPoints < offer.pointsCost) {
      setError("You don't have enough points for this offer.");
      return;
    }
    
    if (!window.confirm(`Redeem "${offer.title}" for ${offer.pointsCost} points?`)) {
      return;
    }

    try {
      const newVoucher = await redeemOffer(offer._id);
      setMyVouchers((prev) => [newVoucher, ...prev]);
      setCurrentPoints((prev) => prev - offer.pointsCost);
      setMessage(`Successfully redeemed "${offer.title}"!`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* --- Header & Back Link --- */}
        <div className="flex items-center justify-between mb-8">
          <Link 
            to="/dashboard" 
            className="flex items-center text-emerald-600 hover:text-emerald-800 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Back to Dashboard
          </Link>
          <h2 className="text-3xl font-bold text-slate-900">Rewards Marketplace</h2>
          <div className="w-24"></div> {/* Spacer for centering */}
        </div>

        {/* --- Points Banner --- */}
        <div className="bg-linear-to-r from-amber-400 to-orange-500 rounded-2xl shadow-lg p-8 text-center text-white mb-10 transform hover:scale-[1.01] transition-transform duration-300">
          <p className="text-lg font-medium opacity-90 uppercase tracking-wide">Current Balance</p>
          <h3 className="text-5xl font-extrabold mt-2">{currentPoints} <span className="text-2xl font-normal">Points</span></h3>
          <p className="mt-4 text-sm opacity-80">Earn more points by recycling!</p>
        </div>
        
        {/* --- Messages --- */}
        {message && (
          <div className="mb-6 p-4 bg-green-100 border-l-4 border-green-500 text-green-700 rounded shadow-sm flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {message}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded shadow-sm flex items-center">
            <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* --- Left Column: Available Offers --- */}
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <span className="bg-indigo-100 text-indigo-800 p-2 rounded-lg mr-3">🎁</span>
              Available Offers
            </h3>
            
            {offers.length === 0 ? (
              // --- STYLED EMPTY STATE FOR OFFERS (Amber Theme) ---
              <div className="bg-amber-50 rounded-xl shadow-sm border-2 border-dashed border-amber-200 p-10 text-center flex flex-col items-center justify-center transition-colors hover:bg-amber-100/50">
                <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
                  {/* Gift Icon */}
                  <svg className="w-10 h-10 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-amber-900">No offers available</h4>
                <p className="text-amber-700/70 mt-1 text-sm max-w-xs mx-auto">
                  Check back soon! We are working with partners to bring you new rewards.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {offers.map((offer) => (
                  <div key={offer._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <h4 className="text-lg font-bold text-gray-900">{offer.title}</h4>
                        <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
                          {offer.pointsCost} pts
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{offer.description}</p>
                      <p className="text-xs text-gray-400 mt-2">Partner: {offer.partnerName}</p>
                    </div>
                    
                    <button
                      onClick={() => handleRedeem(offer)}
                      disabled={currentPoints < offer.pointsCost}
                      className={`mt-4 w-full py-2 px-4 rounded-lg font-bold text-sm shadow-sm transition-all ${
                        currentPoints < offer.pointsCost 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                      }`}
                    >
                      {currentPoints < offer.pointsCost ? `Need ${offer.pointsCost - currentPoints} more pts` : 'Redeem Now'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* --- Right Column: My Vouchers --- */}
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
              <span className="bg-green-100 text-green-800 p-2 rounded-lg mr-3">🎟️</span>
              My Wallet
            </h3>
            
            {myVouchers.length === 0 ? (
              // --- STYLED EMPTY STATE FOR VOUCHERS (Emerald Theme) ---
              <div className="bg-emerald-50 rounded-xl shadow-sm border-2 border-dashed border-emerald-200 p-10 text-center flex flex-col items-center justify-center transition-colors hover:bg-emerald-100/50">
                <div className="bg-white p-4 rounded-full mb-4 shadow-sm">
                  {/* Ticket Icon */}
                  <svg className="w-10 h-10 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-emerald-900">No vouchers yet</h4>
                <p className="text-emerald-700/70 mt-1 text-sm max-w-xs mx-auto">
                  Redeem your points for offers on the left to see your voucher codes here!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {myVouchers.map((voucher) => (
                  <div key={voucher._id} className="bg-white rounded-xl shadow-sm border-l-4 border-l-emerald-500 p-5 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mt-2 -mr-2 w-16 h-16 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                    
                    <h4 className="text-lg font-bold text-gray-800 relative z-10">{voucher.title}</h4>
                    <p className="text-sm text-gray-600 mb-3 relative z-10">{voucher.description}</p>
                    
                    <div className="bg-slate-100 rounded-lg p-3 text-center border border-dashed border-slate-300 relative z-10">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Voucher Code</p>
                      <p className="text-xl font-mono font-bold text-emerald-700 tracking-widest select-all">
                        {voucher.uniqueCode}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default RewardsPage;