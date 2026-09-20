import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken, removeAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 1,
    email: 'farmer@agroshield.ai',
    full_name: 'Ramesh Gowda',
    role: 'farmer',
    preferred_lang: 'kn',
    phone: '+91 98451 23456',
    district: 'Kolar',
    village: 'Srinivaspur'
  });
  const [token, setToken] = useState(getAuthToken());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Attempt auto-load current user if token exists
    if (token) {
      api.getMe()
        .then(u => setUser(u))
        .catch(() => {
          // Keep default demo user for seamless offline / quick demo experience
        });
    }
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.login(email, password);
      setAuthToken(res.access_token);
      setToken(res.access_token);
      setUser({
        id: res.user_id,
        email,
        full_name: res.full_name,
        role: res.role,
        preferred_lang: res.preferred_lang
      });
      return res;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    removeAuthToken();
    setToken(null);
    setUser(null);
  };

  // Quick Demo Role Switcher for SIH evaluation
  const switchRole = (newRole) => {
    if (newRole === 'farmer') {
      setUser({
        id: 1,
        email: 'farmer@agroshield.ai',
        full_name: 'Ramesh Gowda',
        role: 'farmer',
        preferred_lang: 'kn',
        phone: '+91 98451 23456',
        district: 'Kolar',
        village: 'Srinivaspur'
      });
    } else if (newRole === 'officer') {
      setUser({
        id: 2,
        email: 'officer@agroshield.ai',
        full_name: 'Dr. Ananya Sharma',
        role: 'officer',
        preferred_lang: 'en',
        phone: '+91 94480 87654',
        district: 'Kolar',
        badge: 'KA-AGRI-0482'
      });
    } else if (newRole === 'admin') {
      setUser({
        id: 3,
        email: 'admin@agroshield.ai',
        full_name: 'Chief Admin AgroShield',
        role: 'admin',
        preferred_lang: 'en',
        phone: '+91 80222 55555'
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
export default useAuth;
