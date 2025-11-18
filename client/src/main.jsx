// src/main.jsx
import 'leaflet/dist/leaflet.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { BrowserRouter } from 'react-router-dom'; // Import
import './index.css'; // <-- **THIS IS THE NEW LINE**

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter> {/* Wrap the App */}
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);