import axios from 'axios';

const resultQueryClient = axios.create({
  baseURL: import.meta.env.VITE_RESULT_QUERY_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

resultQueryClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

resultQueryClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

const endpoints = {
  resultByRequest: '/results/request/',
  resultsByImage: '/results/image/',
  resultsByUser: '/results/user/',
  resultsByDevice: '/results/device/',
  allResults: '/results/all-cursor',
  resultsSummary: '/results/summary',
  userStats: '/results/stats/user/',
  inferenceStats: '/results/stats/inference',
  healthCheck: '/health/',
  healthDetailed: '/health/detailed',
  healthReady: '/health/ready',
  healthLive: '/health/live',
  servicesStatus: '/health/services',
};

export const getResultByRequestId = async (requestId) => {
  const response = await resultQueryClient.get(`${endpoints.resultByRequest}${requestId}`);
  return response.data;
};

export const getResultsByImageId = async (imageId) => {
  const response = await resultQueryClient.get(`${endpoints.resultsByImage}${imageId}`);
  return response.data;
};

export const getResultsByUserId = async (userId, limit = 20) => {
  const response = await resultQueryClient.get(`${endpoints.resultsByUser}${userId}`, {
    params: { page_size: limit }
  });
  return response.data;
};

export const getResultsByDeviceId = async (deviceId, limit = 20) => {
  const response = await resultQueryClient.get(`${endpoints.resultsByDevice}${deviceId}`, {
    params: { page_size: limit }
  });
  return response.data;
};

export const getAllResults = async (params = {}) => {
  const {
    cursor = null,
    pageSize = 20,
    statusFilter = null,
    userId = null,
    deviceId = null,
    startDate = null,
    endDate = null
  } = params;

  const queryParams = {
    page_size: pageSize
  };

  if (cursor) {
    queryParams.cursor = cursor;
  }

  if (statusFilter === 'error' || statusFilter === 'partial_error') {
    queryParams.exclude_errors = false;
  } else {
    queryParams.exclude_errors = true;
  }

  if (statusFilter) queryParams.status_filter = statusFilter;
  if (userId) queryParams.user_id = userId;
  if (deviceId) queryParams.device_id = deviceId;
  if (startDate) queryParams.start_date = startDate;
  if (endDate) queryParams.end_date = endDate;

  const response = await resultQueryClient.get(endpoints.allResults, {
    params: queryParams
  });
  return response.data;
};

export const getResultsSummary = async (days = 7, deviceId = null) => {
  const params = { days };
  if (deviceId) params.device_id = deviceId;

  const response = await resultQueryClient.get(endpoints.resultsSummary, { params });
  return response.data;
};

export const getInferenceStats = async (days = 7) => {
  const response = await resultQueryClient.get(endpoints.inferenceStats, {
    params: { days }
  });
  return response.data;
};

export const getUserStats = async (userId, days = 30) => {
  const response = await resultQueryClient.get(`${endpoints.userStats}${userId}`, {
    params: { days }
  });
  return response.data;
};

export const healthCheck = async () => {
  const response = await resultQueryClient.get(endpoints.healthCheck);
  return response.data;
};

export const healthCheckDetailed = async () => {
  const response = await resultQueryClient.get(endpoints.healthDetailed);
  return response.data;
};

export const readinessCheck = async () => {
  const response = await resultQueryClient.get(endpoints.healthReady);
  return response.data;
};

export const livenessCheck = async () => {
  const response = await resultQueryClient.get(endpoints.healthLive);
  return response.data;
};

export const getServicesStatus = async () => {
  const response = await resultQueryClient.get(endpoints.servicesStatus);
  return response.data;
};

export default {
  getResultByRequestId,
  getResultsByImageId,
  getResultsByUserId,
  getResultsByDeviceId,
  getAllResults,
  getResultsSummary,
  getInferenceStats,
  getUserStats,
  healthCheck,
  healthCheckDetailed,
  readinessCheck,
  livenessCheck,
  getServicesStatus,
};