import Axios from 'axios';
import { AUTH_TOKEN_KEY } from '@/app/auth/AuthContext';
import { isBrowser } from '@/utils/ssr';

Axios.interceptors.request.use(
  (config = {}) => {
    const token = isBrowser ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
    const authHeaders = token ? { Authorization: `Bearer ${token}` } : {};
    return {
      baseURL:
        process.env.NODE_ENV === 'production'
          ? process.env.API_BASE_URL || '/api'
          : `http://${window.location.hostname}:8080/api`,
      ...config,
      headers: {
        ...authHeaders,
        ...(config.headers || {}),
      },
    };
  },
  (error) => Promise.reject(error)
);

Axios.interceptors.response.use((response) => {
  if (response?.headers?.['x-total-count']) {
    return {
      content: response?.data,
      totalItems: response?.headers['x-total-count'],
    };
  }
  return response?.data;
});
