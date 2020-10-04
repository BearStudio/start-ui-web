import axios from 'axios';

axios.interceptors.request.use(
  (config) => ({
    ...config,
    baseURL: 'http://localhost:8080',
    // Custom config
  }),
  (error) => Promise.reject(error)
);

export const reactQueryConfig = () => {
  // Return only the data
  axios.interceptors.response.use((response) => response?.data);
};
