import apiClient from './apiClient';

const endpoints = {
  dashboard: '/devices/analytics/dashboard',
  fleetAnalytics: '/devices/analytics/fleet',
  locationAnalytics: '/devices/analytics/location/',
  
  listDevices: '/devices/',
  getDevice: '/devices/',
  registerDevice: '/devices/register',
  deleteDevice: '/devices/',
  updateStatus: '/devices/',
  
  heartbeat: '/devices/heartbeat',
  checkOffline: '/devices/offline/check',
  
  deviceAnalytics: '/devices/',
  deviceHealth: '/devices/',
  deviceTrends: '/devices/',
  
  generateConfig: '/devices/setup/config'
};

export const getDashboardData = async () => {
  const response = await apiClient.get(endpoints.dashboard);
  return response.data;
};

export const getFleetAnalytics = async (days = 7) => {
  const response = await apiClient.get(endpoints.fleetAnalytics, {
    params: { days }
  });
  return response.data;
};

export const getLocationAnalytics = async (location, days = 7) => {
  const response = await apiClient.get(`${endpoints.locationAnalytics}${location}`, {
    params: { days }
  });
  return response.data;
};

export const listDevices = async (filters = {}) => {
  const { status, location } = filters;
  const params = {};
  if (status) params.status = status;
  if (location) params.location = location;
  
  const response = await apiClient.get(endpoints.listDevices, { params });
  return response.data;
};

export const getDevice = async (deviceId) => {
  const response = await apiClient.get(`${endpoints.getDevice}${deviceId}`);
  return response.data;
};

export const registerDevice = async (deviceData) => {
  const response = await apiClient.post(endpoints.registerDevice, deviceData);
  return response.data;
};

export const deleteDevice = async (deviceId) => {
  const response = await apiClient.delete(`${endpoints.deleteDevice}${deviceId}`);
  return response.data;
};

export const updateDeviceStatus = async (deviceId, status) => {
  const response = await apiClient.put(`${endpoints.updateStatus}${deviceId}/status`, null, {
    params: { status }
  });
  return response.data;
};

export const sendHeartbeat = async (heartbeatData) => {
  const response = await apiClient.post(endpoints.heartbeat, heartbeatData);
  return response.data;
};

export const checkOfflineDevices = async (timeoutMinutes = 5) => {
  const response = await apiClient.get(endpoints.checkOffline, {
    params: { timeout_minutes: timeoutMinutes }
  });
  return response.data;
};

export const getDeviceAnalytics = async (deviceId, days = 7) => {
  const response = await apiClient.get(`${endpoints.deviceAnalytics}${deviceId}/analytics`, {
    params: { days }
  });
  return response.data;
};

export const getDeviceHealth = async (deviceId) => {
  const response = await apiClient.get(`${endpoints.deviceHealth}${deviceId}/health`);
  return response.data;
};

export const getDeviceTrends = async (deviceId, days = 30) => {
  const response = await apiClient.get(`${endpoints.deviceTrends}${deviceId}/trends`, {
    params: { days }
  });
  return response.data;
};

export const generateDeviceConfig = async (configData) => {
  const response = await apiClient.post(endpoints.generateConfig, configData);
  return response.data;
};

export const startDashboardPolling = (callback, intervalSeconds = 30) => {
  const pollDashboard = async () => {
    try {
      const data = await getDashboardData();
      callback(null, data);
    } catch (error) {
      callback(error, null);
    }
  };

  pollDashboard();

  const intervalId = setInterval(pollDashboard, intervalSeconds * 1000);
  return () => clearInterval(intervalId);
};