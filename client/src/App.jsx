// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import RewardsPage from './pages/RewardsPage';

function App() {
  return (
    <Routes>
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/rewards" element={<RewardsPage />} />
      
      {/* Default route redirects to login */}
      <Route path="/" element={<Navigate to="/login" />} /> 
    </Routes>
  );
}

export default App;