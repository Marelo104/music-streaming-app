import axios from 'axios';

const api = axios.create({
  // in production same domain so just /api
  // in development still needs the full localhost URL
  baseURL: import.meta.mode === 'development'
    ? 'http://localhost:5000/api'
    : '/api',
  withCredentials: true,
});

// interceptor goes here
api.interceptors.response.use(
  (response) => response,  // if success just return response
  (error) => {
    if (error.response?.status === 401) {
      // redirect to login
    }
    return Promise.reject(error);
  }
);

export default api;