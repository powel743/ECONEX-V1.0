import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate, Link } from 'react-router-dom';

// Import our new dashboard components
import UserDashboard from '../components/UserDashboard';
import CollectorDashboard from '../components/CollectorDashboard';
import BuyerDashboard from '../components/BuyerDashboard';
import AdminDashboard from '../components/AdminDashboard';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false); // For mobile menu

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Helper function to render the correct dashboard
  const renderDashboard = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'user':
        return <UserDashboard />;
      case 'collector':
        return <CollectorDashboard />;
      case 'buyer':
        return <BuyerDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return (
          <div className="text-center mt-10 p-4 bg-red-50 text-red-600 rounded-lg border border-red-200">
            <p>Unknown user role.</p>
          </div>
        );
    }
  };

  // If user data is not loaded yet (or they logged out)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="mb-4 text-gray-700">You are not logged in.</p>
          <button 
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* --- Responsive Navbar --- */}
      <nav className="bg-emerald-700 shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/dashboard" className="shrink-0 flex items-center">
                {/* Simple leaf icon using SVG */}
                <svg className="w-8 h-8 text-emerald-300 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v11a3 3 0 106 0V4a2 2 0 00-2-2H4zm1 14a1 1 0 100-2 1 1 0 000 2zm5-1.757l4.9-4.9a2 2 0 000-2.828L13.485 5.1a2 2 0 00-2.828 0L10 5.757v8.486zM16 18H9.071l6-6H16a2 2 0 012 2v2a2 2 0 01-2 2z" clipRule="evenodd" />
                </svg>
                <span className="text-white text-2xl font-bold tracking-tight">Econex</span>
              </Link>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="ml-4 flex items-center space-x-4">
                <div className="text-right mr-4">
                  <p className="text-emerald-100 text-xs uppercase font-semibold tracking-wider">Logged in as</p>
                  <p className="text-white text-sm font-bold">{user.name} <span className="bg-emerald-900 text-emerald-200 text-xs py-0.5 px-2 rounded-full ml-1 capitalize">{user.role}</span></p>
                </div>
                <button
                  onClick={handleLogout}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors border border-emerald-600 hover:border-emerald-500"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="-mr-2 flex md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-emerald-800 inline-flex items-center justify-center p-2 rounded-md text-emerald-100 hover:text-white hover:bg-emerald-700 focus:outline-none"
              >
                <span className="sr-only">Open main menu</span>
                {/* Hamburger Icon */}
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-emerald-800 border-t border-emerald-700 pb-3 px-2 pt-2 sm:px-3 shadow-inner">
            <div className="text-emerald-100 px-3 py-3 border-b border-emerald-700 mb-2">
              <p className="text-xs uppercase opacity-75">User</p>
              <p className="font-bold text-white text-lg">{user.name}</p>
              <p className="text-sm capitalize text-emerald-300">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="block w-full text-left mt-1 px-3 py-3 rounded-md text-base font-medium text-white hover:bg-red-600 hover:text-white transition-colors bg-emerald-900/50"
            >
              Logout
            </button>
          </div>
        )}
      </nav>

      {/* --- Main Content Area --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderDashboard()}
      </main>
    </div>
  );
}

export default Dashboard;