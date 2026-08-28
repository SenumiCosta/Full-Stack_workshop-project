import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('syncboard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for conflict handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If conflict (409), pass the error to be handled by the component
    if (error.response && error.response.status === 409) {
      return Promise.reject({
        ...error,
        isConflict: true,
        serverData: error.response.data.serverData,
        serverUpdatedAt: error.response.data.serverUpdatedAt
      });
    }
    return Promise.reject(error);
  }
);

export default api;