import axios from 'axios';

const api = axios.create({
  // in production same domain so just /api
  // in development still needs the full localhost URL
  baseURL: import.meta.env.MODE === 'development'
    ? 'http://localhost:5000/api'
    : '/api',
  withCredentials: true,
    headers: {
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
  }
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