import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const storedToken = localStorage.getItem('crimepilot_token');
      const storedUser = localStorage.getItem('crimepilot_user');
      const storedDetails = localStorage.getItem('crimepilot_details');

      if (storedToken && storedUser) {
        try {
          // Verify token validity by calling a lightweight protected endpoint
          await axiosInstance.get('/notifications');
          
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          if (storedDetails) {
            setDetails(JSON.parse(storedDetails));
          }
        } catch (error) {
          console.error('Session validation failed on init:', error);
          localStorage.removeItem('crimepilot_token');
          localStorage.removeItem('crimepilot_user');
          localStorage.removeItem('crimepilot_details');
          setToken(null);
          setUser(null);
          setDetails(null);
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (usernameOrEmail, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        usernameOrEmail,
        password,
      });

      const { token: jwtToken, user: userData, details: userDetails } = response.data;

      // Save to state
      setToken(jwtToken);
      setUser(userData);
      setDetails(userDetails);

      // Save to localStorage
      localStorage.setItem('crimepilot_token', jwtToken);
      localStorage.setItem('crimepilot_user', JSON.stringify(userData));
      if (userDetails) {
        localStorage.setItem('crimepilot_details', JSON.stringify(userDetails));
      } else {
        localStorage.removeItem('crimepilot_details');
      }

      return { success: true, role: userData.role };
    } catch (error) {
      const msg = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message: msg };
    }
  };

  const citizenLogin = async (usernameOrEmail, password) => {
    try {
      const response = await axiosInstance.post('/auth/citizen/login', {
        usernameOrEmail,
        password,
      });

      const { token: jwtToken, user: userData, details: userDetails } = response.data;

      // Save to state
      setToken(jwtToken);
      setUser(userData);
      setDetails(userDetails);

      // Save to localStorage
      localStorage.setItem('crimepilot_token', jwtToken);
      localStorage.setItem('crimepilot_user', JSON.stringify(userData));
      if (userDetails) {
        localStorage.setItem('crimepilot_details', JSON.stringify(userDetails));
      } else {
        localStorage.removeItem('crimepilot_details');
      }

      return { success: true, role: userData.role };
    } catch (error) {
      // Fallback to standard login if needed
      return login(usernameOrEmail, password);
    }
  };

  const logout = () => {
    const isCitizen = user?.role === 'citizen';
    setToken(null);
    setUser(null);
    setDetails(null);
    localStorage.removeItem('crimepilot_token');
    localStorage.removeItem('crimepilot_user');
    localStorage.removeItem('crimepilot_details');
    
    // Redirect cleanly to release state memory and ensure back-button security
    if (isCitizen) {
      window.location.href = '/citizen/login';
    } else {
      window.location.href = '/login';
    }
  };

  const refreshProfile = async () => {
    try {
      if (user && user.role !== 'admin') {
        const route = user.role === 'officer' ? '/dashboard/officer' : '/dashboard/analyst';
        const response = await axiosInstance.get(route);
        // If there's new data about the officer/analyst profile, refresh it
        if (response.data && response.data.details) {
          setDetails(response.data.details);
          localStorage.setItem('crimepilot_details', JSON.stringify(response.data.details));
        }
      }
    } catch (err) {
      console.error('Failed to refresh user profile data:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        details,
        setDetails,
        loading,
        login,
        citizenLogin,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
