import axios from 'axios';

// Create API instance
const api = axios.create({
  baseURL: 'http://localhost:9005/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: false, // no need for cookies since you use JWT
});

// ✅ Interceptor to attach JWT token
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      const parsed = JSON.parse(user);
      if (parsed.token) {
        config.headers.Authorization = `Bearer ${parsed.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
