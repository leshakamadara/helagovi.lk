import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://api.helagovi.lk/api'
    : 'http://localhost:5001/api');

console.log('API Base URL:', baseURL);
console.log('Environment:', import.meta.env.MODE);
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL: baseURL,
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log('Making API request to:', config.baseURL + config.url);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API response received:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API error:', error.message);
    console.error('API error details:', error.response?.data);
    return Promise.reject(error);
  }
);

export default api;
export { api };
