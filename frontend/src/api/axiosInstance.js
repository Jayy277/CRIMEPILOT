import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject JWT token from localStorage
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('crimepilot_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Catch 401 Unauthorized errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear session
      localStorage.removeItem('crimepilot_token');
      localStorage.removeItem('crimepilot_user');
      localStorage.removeItem('crimepilot_details');
      
      const pathname = window.location.pathname;
      const isCitizenRoute = pathname.startsWith('/citizen');
      
      // Redirect to login only if not already on the login page
      if (isCitizenRoute) {
        if (pathname !== '/citizen/login') {
          window.location.href = '/citizen/login';
        }
      } else {
        if (pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
