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


export default api;