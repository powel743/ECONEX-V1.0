import React, { useState } from 'react';
import { setMarketPrice, createDiscountOffer } from '../api/adminApi';

function AdminDashboard() {
  const [priceData, setPriceData] = useState({ wasteType: 'lightweight', pricePerKg: 10 });
  const [offerData, setOfferData] = useState({
    title: '',
    description: '',
    partnerName: '',
    pointsCost: 100,
  });
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handlePriceChange = (e) => {
    setPriceData({ ...priceData, [e.target.name]: e.target.value });
  };

  const handlePriceSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const data = { ...priceData, pricePerKg: Number(priceData.pricePerKg) };
      await setMarketPrice(data);
      setMessage(`Price for ${data.wasteType} set to KSh ${data.pricePerKg}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleOfferChange = (e) => {
    setOfferData({ ...offerData, [e.target.name]: e.target.value });
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const data = { ...offerData, pointsCost: Number(offerData.pointsCost) };
      await createDiscountOffer(data);
      setMessage(`New offer "${data.title}" created!`);
      // Clear form
      setOfferData({ title: '', description: '', partnerName: '', pointsCost: 100 });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8">
        <h3 className="text-3xl font-bold text-slate-900">Admin Control Panel</h3>
        <p className="text-slate-500 mt-2">Manage market prices and create rewards for users.</p>
      </div>

      {/* --- Global Messages --- */}
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* --- Set Market Price Form --- */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-emerald-800 px-6 py-4 border-b border-emerald-700">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Set Market Prices
            </h4>
          </div>
          <div className="p-6">
            <form onSubmit={handlePriceSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Waste Type</label>
                <select 
                  name="wasteType" 
                  value={priceData.wasteType} 
                  onChange={handlePriceChange}
                  className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                >
                  <option value="lightweight">Lightweight</option>
                  <option value="heavyweight">Heavyweight</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (per Kg) in KSh</label>
                <input
                  type="number"
                  name="pricePerKg"
                  value={priceData.pricePerKg}
                  onChange={handlePriceChange}
                  min="0"
                  step="1"
                  className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-emerald-500 focus:ring-emerald-500 transition-colors"
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full mt-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold py-3 rounded-lg shadow-md transition-all active:scale-[0.98]"
              >
                Update Price
              </button>
            </form>
          </div>
        </div>

        {/* --- Create Voucher Form --- */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <div className="bg-amber-600 px-6 py-4 border-b border-amber-500">
            <h4 className="text-lg font-semibold text-white flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
              Create New Voucher
            </h4>
          </div>
          <div className="p-6">
            <form onSubmit={handleOfferSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Voucher Title</label>
                <input 
                  type="text" 
                  name="title" 
                  value={offerData.title} 
                  onChange={handleOfferChange} 
                  placeholder="e.g., 10% Off Coffee" 
                  required 
                  className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Partner Name</label>
                  <input 
                    type="text" 
                    name="partnerName" 
                    value={offerData.partnerName} 
                    onChange={handleOfferChange} 
                    placeholder="e.g., Java House" 
                    required 
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Points Cost</label>
                  <input 
                    type="number" 
                    name="pointsCost" 
                    value={offerData.pointsCost} 
                    onChange={handleOfferChange} 
                    min="1" 
                    required 
                    className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-amber-500 focus:ring-amber-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description" 
                  value={offerData.description} 
                  onChange={handleOfferChange} 
                  placeholder="Brief description of the offer..." 
                  required 
                  rows="3"
                  className="block w-full rounded-lg border-gray-300 bg-gray-50 p-2.5 text-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full mt-4 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg shadow-md transition-all active:scale-[0.98]"
              >
                Create Offer
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;