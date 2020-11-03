import axios from 'axios';
import { AUTH_TOKEN_KEY } from '@/app/auth/AuthContext';
import { isBrowser } from '@/utils/ssr';

axios.interceptors.request.use(
  (config = {}) => {
    const token = isBrowser ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    return {
      baseURL: 'http://localhost:8080/api',
      ...config,
      headers: {
        ...authHeaders,
        ...(config.headers || {}),
      },
    };
  },
  (error) => Promise.reject(error)
);

axios.interceptors.response.use((response) => response?.data);
