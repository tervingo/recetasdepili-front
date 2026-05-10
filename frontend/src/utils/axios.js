import axios from 'axios';
import { BACKEND_URL, APP_ID } from '../constants';

const axiosInstance = axios.create({
  baseURL: BACKEND_URL
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }

    // Añadir app_id a todas las peticiones GET como query param
    if (config.method === 'get') {
      config.params = { app_id: APP_ID, ...config.params };
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
