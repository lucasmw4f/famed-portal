import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ufscar_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ufscar_token');
      localStorage.removeItem('ufscar_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
