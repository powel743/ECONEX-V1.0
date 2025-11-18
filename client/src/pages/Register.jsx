// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { register } from '../api/authApi';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user', // Default role
  });
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const userData = await register(formData);
      login(userData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    // Full-screen container, centers content
    <div className="flex items-center justify-center min-h-screen bg-gray-100 font-sans">
      {/* Form Card */}
      <form 
        className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg" 
        onSubmit={handleSubmit}
      >
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Create Account
        </h2>
        
        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            onChange={handleChange}
            required
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="John Doe"
          />
        </div>
        
        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            onChange={handleChange}
            required
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="you@example.com"
          />
        </div>
        
        {/* Password Input */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            name="password"
            onChange={handleChange}
            required
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
          />
        </div>
        
        {/* Role Select */}
        <div>
          <label htmlFor="role" className="block text-sm font-medium text-gray-700">
            I am a...
          </label>
          <select 
            id="role"
            name="role" 
            onChange={handleChange} 
            value={formData.role}
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="user">User (I want to recycle)</option>
            <option value="collector">Collector (I pick up waste)</option>
            <option value="buyer">Buyer (I purchase waste)</option>
          </select>
        </div>
        
        {/* Error Message */}
        {error && (
          <p className="text-sm text-center text-red-600">
            {error}
          </p>
        )}
        
        {/* Submit Button */}
        <button 
          type="submit" 
          className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150"
        >
          Register
        </button>
        
        {/* Link to Login */}
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Login here
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Register;