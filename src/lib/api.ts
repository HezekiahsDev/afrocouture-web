import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('afrocouture_access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        if (typeof window !== 'undefined') {
          const refreshToken = localStorage.getItem('afrocouture_refresh_token');
          if (refreshToken) {
            const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
              refreshToken,
            });
            localStorage.setItem('afrocouture_access_token', data.accessToken);
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return api(originalRequest);
          }
        }
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('afrocouture_access_token');
          localStorage.removeItem('afrocouture_refresh_token');
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

