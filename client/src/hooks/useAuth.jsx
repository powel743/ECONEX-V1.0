import { useContext } from 'react';
// This file is in the 'hooks' folder, so it's one level up
import { AuthContext } from '../context/AuthContext';

// We just re-export the hook for simplicity
export const useAuth = () => {
  return useContext(AuthContext);
};