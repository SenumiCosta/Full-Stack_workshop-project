import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('syncboard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
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