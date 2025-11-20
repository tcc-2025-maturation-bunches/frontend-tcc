import axios from 'axios';

const authClient = axios.create({
  baseURL: import.meta.env.VITE_AUTH_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

authClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token && config.url !== '/auth/login') {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && error.config?.url !== '/auth/login') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export const login = async (username, password) => {
  const response = await authClient.post('/auth/login', {
    username,
    password,
  });
  return response.data;
};

export const verifyToken = async () => {
  const response = await authClient.get('/auth/verify');
  return response.data;
};

export const getCurrentUser = async () => {
  const response = await authClient.get('/auth/me');
  return response.data;
};

export const getUser = async (userId) => {
  const response = await authClient.get(`/users/${userId}`);
  return response.data;
};

export const getUserByUsername = async (username) => {
  const response = await authClient.get(`/users/by-username/${username}`);
  return response.data;
};

export const createUser = async (userData) => {
  const response = await authClient.post('/users/', userData);
  return response.data;
};

export const updateUser = async (userId, userData) => {
  const response = await authClient.put(`/users/${userId}`, userData);
  return response.data;
};

export const deleteUser = async (userId) => {
  await authClient.delete(`/users/${userId}`);
};

export const listUsers = async () => {
  const response = await authClient.get('/users/');
  return response.data;
};

export default authClient;