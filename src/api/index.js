export { default as apiClient, getPublicConfig } from './apiClient';
export * from './authApi';
export * from './deviceMonitoringApi';
export * from './inferenceApi';
export * from './resultQueryApi';

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    VERIFY: '/auth/verify',
    ME: '/auth/me',
  },
  DEVICES: {
    LIST: '/devices',
    REGISTER: '/devices/register',
    DETAILS: '/devices/:id',
    HEARTBEAT: '/devices/:id/heartbeat',
    CONFIG: '/devices/:id/config',
    ANALYTICS: '/devices/analytics/dashboard',
  },
  STORAGE: {
    PRESIGNED_URL: '/storage/presigned-url',
    PRESIGNED_RESULT_URL: '/storage/presigned-result-url',
    BATCH_PRESIGNED_URLS: '/storage/batch-presigned-urls',
    VALIDATE: '/storage/validate/:key',
  },
  PROCESSING: {
    COMBINED_PROCESS: '/combined/process',
    COMBINED_STATUS: '/combined/status/:id',
    BATCH_PROCESS: '/combined/batch-process',
    QUEUE_STATS: '/combined/queue/stats',
    USER_REQUESTS: '/combined/user/:id/requests',
  },
  RESULTS: {
    BY_REQUEST: '/results/request/:id',
    BY_IMAGE: '/results/image/:id',
    BY_USER: '/results/user/:id',
    BY_DEVICE: '/results/device/:id',
    ALL: '/results/all',
    SUMMARY: '/results/summary',
    USER_STATS: '/results/stats/user/:id',
  },
  HEALTH: {
    CHECK: '/health/',
    DETAILED: '/health/detailed',
    READY: '/health/ready',
    LIVE: '/health/live',
    SERVICES: '/health/services',
  },
};