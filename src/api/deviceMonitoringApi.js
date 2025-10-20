import axios from 'axios';

const deviceClient = axios.create({
  baseURL: import.meta.env.VITE_DEVICE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

deviceClient.interceptors.request.use(
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

deviceClient.interceptors.response.use(
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

export const listDevices = async (filters = {}) => {
  const { status_filter, location_filter, limit = 100 } = filters;
  const params = { limit };
  
  if (status_filter) params.status_filter = status_filter;
  if (location_filter) params.location_filter = location_filter;
  
  const response = await deviceClient.get('/devices', { params });
  return response.data;
};

export const getRecentDevices = async (limit = 50) => {
  const response = await deviceClient.get('/devices/recent', {
    params: { limit }
  });
  return response.data;
};

export const getDevicesByStatus = async (deviceStatus, limit = 100) => {
  const response = await deviceClient.get(`/devices/by-status/${deviceStatus}`, {
    params: { limit }
  });
  return response.data;
};

export const getDevice = async (deviceId) => {
  const response = await deviceClient.get(`/devices/${deviceId}`);
  return response.data;
};

export const registerDevice = async (deviceData) => {
  const response = await deviceClient.post('/devices/register', deviceData);
  return response.data;
};

export const deleteDevice = async (deviceId) => {
  const response = await deviceClient.delete(`/devices/${deviceId}`);
  return response.data;
};

export const sendHeartbeat = async (deviceId, heartbeatData) => {
  const response = await deviceClient.post(`/devices/${deviceId}/heartbeat`, heartbeatData);
  return response.data;
};

export const updateDeviceConfig = async (deviceId, configData) => {
  const response = await deviceClient.put(`/devices/${deviceId}/config`, configData);
  return response.data;
};

export const updateGlobalConfig = async (configData) => {
  const response = await deviceClient.post('/devices/global-config', configData);
  return response.data;
};

export const getDeviceStats = async () => {
  const response = await deviceClient.get('/devices/stats/overview');
  return response.data;
};

export const getInferenceStatsSummary = async (days = 7, deviceId = null) => {
  try {
    const params = { days };
    if (deviceId) params.device_id = deviceId;

    const response = await resultQueryClient.get(endpoints.resultsSummary, { params });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar estatísticas resumidas:', error);
    throw error;
  }
};

export const getLocationAnalytics = async (location) => {
  try {
    const response = await resultQueryClient.get(`/analytics/location/${location}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar analytics de localização:', error);
    throw error;
  }
};

export const notifyProcessingComplete = async (deviceId, notification) => {
  const response = await deviceClient.post(
    `/devices/${deviceId}/processing-notification`,
    notification
  );
  return response.data;
};

export const checkOfflineDevices = async () => {
  const response = await deviceClient.post('/devices/maintenance/check-offline');
  return response.data;
};

export const healthCheck = async () => {
  const response = await deviceClient.get('/health/');
  return response.data;
};

export const detailedHealthCheck = async () => {
  const response = await deviceClient.get('/health/detailed');
  return response.data;
};

export const readinessCheck = async () => {
  const response = await deviceClient.get('/health/ready');
  return response.data;
};

export const livenessCheck = async () => {
  const response = await deviceClient.get('/health/live');
  return response.data;
};

export const getDevicesStatus = async () => {
  const response = await deviceClient.get('/health/devices-status');
  return response.data;
};

export const getDashboardData = async () => {
  try {
    const [stats, devices] = await Promise.all([
      getDeviceStats(),
      listDevices({ limit: 100 })
    ]);

    const devicesList = Array.isArray(devices) ? devices : (devices.devices || []);

    const onlineDevices = devicesList.filter(d => d.status === 'online').length;
    const offlineDevices = devicesList.filter(d => d.status === 'offline').length;
    const maintenanceDevices = devicesList.filter(d => d.status === 'maintenance').length;
    const errorDevices = devicesList.filter(d => d.status === 'error').length;

    const totalCaptures = devicesList.reduce((sum, d) => sum + (d.stats?.total_captures || 0), 0);
    const successfulCaptures = devicesList.reduce((sum, d) => sum + (d.stats?.successful_captures || 0), 0);
    
    const devicesWithCaptures = devicesList.filter(d => (d.stats?.total_captures || 0) > 0);
    const averageSuccessRate = devicesWithCaptures.length > 0
      ? devicesWithCaptures.reduce((sum, d) => {
          const deviceRate = (d.stats.successful_captures || 0) / d.stats.total_captures * 100;
          return sum + deviceRate;
        }, 0) / devicesWithCaptures.length
      : 0;

    return {
      data: {
        total_devices: stats.total_devices || devicesList.length,
        online_devices: stats.online_devices || onlineDevices,
        offline_devices: stats.offline_devices || offlineDevices,
        maintenance_devices: stats.maintenance_devices || maintenanceDevices,
        error_devices: stats.error_devices || errorDevices,
        devices_by_location: stats.devices_by_location || {},
        recent_registrations: stats.recent_registrations || [],
        average_success_rate: averageSuccessRate,
      },
      devices: devicesList
    };
  } catch (error) {
    console.error('Error getting dashboard data:', error);
    throw error;
  }
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

  const intervalId = setInterval(pollDashboard, intervalSeconds * 1000);
  return () => clearInterval(intervalId);
};

export default deviceClient;