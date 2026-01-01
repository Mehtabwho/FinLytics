import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Inject financial year into query params for GET requests
  if (config.method === 'get') {
    const year = localStorage.getItem('financialYear');
    if (year) {
      config.params = { ...config.params, year };
    }
  }

  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
