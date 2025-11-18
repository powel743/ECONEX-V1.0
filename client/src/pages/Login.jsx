import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { login as loginApi } from '../api/authApi';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const { login } = useAuth(); // This is the login from our AuthContext
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
      const userData = await loginApi(formData);
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
          Login to Econex
        </h2>
        
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
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
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
            className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="••••••••"
          />
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
          className="w-full px-4 py-2 font-medium text-white bg-green-600 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150"
        >
          Login
        </button>
        
        {/* Link to Register */}
        <p className="text-sm text-center text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
            Register here
          </Link>
        </p>
      </form>
    </div>
  );
}

export default Login;