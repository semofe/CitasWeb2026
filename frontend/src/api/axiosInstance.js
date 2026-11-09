import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token en requests
axiosInstance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globalmente
axiosInstance.interceptors.response.use(
  response => response,
  error => {
    const hasActiveSession = Boolean(localStorage.getItem('token'));

    // Solo redirigir si un usuario autenticado recibe un 401 por token vencido.
    // En un login fallido no existe sesión y Login.jsx debe mostrar su mensaje.
    if (error.response?.status === 401 && hasActiveSession) {
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userDni');
      localStorage.removeItem('userName');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
