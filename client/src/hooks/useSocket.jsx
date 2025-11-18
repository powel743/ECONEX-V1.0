// src/hooks/useSocket.js
import { useContext } from 'react';
import { SocketContext } from '../context/AuthContext';

export const useSocket = () => {
  return useContext(SocketContext);
};