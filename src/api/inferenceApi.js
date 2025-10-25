import axios from 'axios';
import { getAllResults, getResultByRequestId, getResultsSummary } from './resultQueryApi';

const requestHandlerClient = axios.create({
  baseURL: import.meta.env.VITE_REQUEST_HANDLER_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

requestHandlerClient.interceptors.request.use(
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

requestHandlerClient.interceptors.response.use(
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
  presignedUrl: '/storage/presigned-url',
  presignedResultUrl: '/storage/presigned-result-url',
  batchPresignedUrls: '/storage/batch-presigned-urls',
  validateFile: '/storage/validate/',
  combinedProcess: '/combined/process',
  combinedStatus: '/combined/status/',
  userRequests: '/combined/user/',
  batchProcess: '/combined/batch-process',
  queueStats: '/combined/queue/stats',
};

export const getPresignedUrl = async (filename, contentType, userId) => {
  const response = await requestHandlerClient.post(endpoints.presignedUrl, {
    filename,
    content_type: contentType,
    user_id: userId,
  });
  return response.data;
};

export const getPresignedResultUrl = async (filename, contentType, userId) => {
  const response = await requestHandlerClient.post(endpoints.presignedResultUrl, {
    filename,
    content_type: contentType,
    user_id: userId,
  });
  return response.data;
};

export const getBatchPresignedUrls = async (requests) => {
  const response = await requestHandlerClient.post(endpoints.batchPresignedUrls, {
    requests
  });
  return response.data;
};

export const validateFileExists = async (key, bucket = 'images') => {
  const response = await requestHandlerClient.get(`${endpoints.validateFile}${key}`, {
    params: { bucket }
  });
  return response.data;
};

export const uploadImageToS3 = async (presignedUrl, file, contentType) => {
  const response = await fetch(presignedUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': contentType,
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
  }

  return response;
};

export const processImageCombined = async (imageUrl, metadata, resultUploadUrl = null) => {
  const requiredFields = ['user_id', 'image_id', 'location'];
  const missingFields = requiredFields.filter(field => !metadata[field]);

  if (missingFields.length > 0) {
    throw new Error(`Campos obrigatórios faltando no metadata: ${missingFields.join(', ')}`);
  }

  const requestBody = {
    image_url: imageUrl,
    metadata: metadata,
    result_upload_url: resultUploadUrl
  };

  const response = await requestHandlerClient.post(endpoints.combinedProcess, requestBody);
  return response.data;
};

export const batchProcessImages = async (requests) => {
  const response = await requestHandlerClient.post(endpoints.batchProcess, requests);
  return response.data;
};

export const getProcessingStatus = async (requestId) => {
  const response = await requestHandlerClient.get(`${endpoints.combinedStatus}${requestId}`);
  return response.data;
};

export const getUserRequests = async (userId, limit = 10, statusFilter = null) => {
  const params = { limit };
  if (statusFilter) params.status_filter = statusFilter;

  const response = await requestHandlerClient.get(`${endpoints.userRequests}${userId}/requests`, {
    params
  });
  return response.data;
};

export const getQueueStats = async () => {
  const response = await requestHandlerClient.get(endpoints.queueStats);
  return response.data;
};

export const getProcessingResults = async (requestId) => {
  const response = await getResultByRequestId(requestId);
  const transformedData = transformBackendDataToFrontend([response]);
  return transformedData[0];
};

export const getInferenceHistory = async (userId, limit = 100) => {
  try {
    const response = await getResultsByUserId(userId, limit);
    const items = response.items || [];
    return transformBackendDataToFrontend(items);
  } catch (error) {
    console.error('Erro ao buscar histórico do usuário:', error);
    throw error;
  }
};

export const getAllInferenceHistory = async (page = 1, pageSize = 25, filters = {}) => {
  try {
    const response = await getAllResults({
      page,
      pageSize,
      statusFilter: filters.statusFilter,
      userId: filters.userId,
      deviceId: filters.deviceId,
      startDate: filters.startDate,
      endDate: filters.endDate
    });

    const transformedData = transformBackendDataToFrontend(response.items || []);

    return {
      items: transformedData,
      current_page: response.current_page || page,
      total_pages: response.total_pages || 1,
      total_count: response.total_count || 0,
      has_previous: response.has_previous || false,
      has_next: response.has_next || false,
    };
  } catch (error) {
    console.error('Erro ao buscar histórico geral:', error);
    throw error;
  }
};


export const getInferenceStatsSummary = async (days = 7) => {
  try {
    const response = await getResultsSummary(days);
    return response;
  } catch (error) {
    console.error('Erro ao buscar estatísticas resumidas:', error);
    throw error;
  }
};

const safeParseFloat = (value, defaultValue = 0.0) => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
};

const safeParseInt = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const num = parseInt(value, 10);
  return isNaN(num) ? defaultValue : num;
};

const transformBackendDataToFrontend = (backendData) => {
  if (!Array.isArray(backendData)) {
    if (!backendData) return [];
    backendData = [backendData];
  }

  return backendData.map(item => {
     if (!item) return null;
    const detection = item.detection_results || item.detection_result || item.detection || {};
    const results = detection.results || [];
    const summary = detection.summary || {};
    const procMetadata = item.processing_metadata || {};
    const initialMetadata = item.initial_metadata || {};
    const additionalMeta = item.additional_metadata || {};

    const location = item.location || initialMetadata.location || additionalMeta.location || 'N/A';

    return {
      image_id: item.image_id || item.request_id || `unknown-${Date.now()}`,
      request_id: item.request_id,
      user_id: item.user_id,
      device_id: item.device_id,
      created_at: item.created_at,
      updated_at: item.updated_at,
      processing_timestamp: item.created_at || item.updated_at || new Date().toISOString(),
      location: location,
      status: item.status === 'success' ? 'completed' : (item.status || 'completed'),
      image_url: item.image_url,
      image_result_url: item.image_result_url,
      thumbnail_url: item.image_url,
      processing_time_ms: item.processing_time_ms,
      detection_result: detection,
      processing_metadata: procMetadata,
      initial_metadata: initialMetadata,
      additional_metadata: additionalMeta,
      results: results.map(r => ({
        class_name: r.class_name,
        confidence: safeParseFloat(r.confidence),
        bounding_box: (r.bounding_box || []).map(b => safeParseFloat(b)),
        maturation_level: r.maturation_level ? {
          category: r.maturation_level.category,
          score: safeParseFloat(r.maturation_level.score),
          estimated_days_until_spoilage: r.maturation_level.estimated_days_until_spoilage
        } : null
      })),
      
      summary: {
        total_objects: safeParseInt(summary.total_objects, results.length),
        objects_with_maturation: safeParseInt(summary.objects_with_maturation, 0),
        average_maturation_score: safeParseFloat(summary.average_maturation_score),
        average_detection_confidence: calculateAverageConfidence(results),
        total_processing_time_ms: safeParseInt(item.processing_time_ms),
        detection_time_ms: safeParseInt(summary.detection_time_ms),
        maturation_analysis_time_ms: safeParseInt(summary.maturation_time_ms),
        model_versions: summary.model_versions || {},
      },
      metadata: {
        source: additionalMeta.source || (item.device_id ? 'monitoring' : 'webcam'),
        timestamp: additionalMeta.timestamp || additionalMeta.capture_timestamp,
        device_id: item.device_id,
        device_info: additionalMeta.device_info,
        image_dimensions: procMetadata.image_dimensions,
        environmental: additionalMeta.environmental || {},
        camera_settings: additionalMeta.camera_settings || {},
      },
    };
  }).filter(item => item !== null);
};

const calculateAverageConfidence = (results) => {
  if (!results || results.length === 0) return 0;

  const sum = results.reduce((acc, r) => {
    const confidence = safeParseFloat(r.confidence, 0);
    return acc + confidence;
  }, 0);
  
  const average = sum / results.length;
  return Math.round(average * 10000) / 10000;
};

export const startHistoryPolling = (userId, callback, intervalSeconds = 60) => {
  let isPolling = true;

  const pollHistory = async () => {
    if (!isPolling) return;
    try {
      const data = await getAllInferenceHistory(1, 1);
      if (isPolling) {
        callback(null, data.items);
      }
    } catch (error) {
      if (isPolling) {
        callback(error, null);
      }
    }
  };

  pollHistory();
  const intervalId = setInterval(pollHistory, intervalSeconds * 1000);

  return () => {
    isPolling = false;
    clearInterval(intervalId);
  };
};

export const getInferenceDetails = async (requestId) => {
  try {
    const response = await getResultByRequestId(requestId);
    const transformedData = transformBackendDataToFrontend([response]);
    return transformedData[0];
  } catch (error) {
    console.error('Erro ao buscar detalhes da inferência:', error);
    throw error;
  }
};

export default {
  getPresignedUrl,
  getPresignedResultUrl,
  getBatchPresignedUrls,
  validateFileExists,
  uploadImageToS3,
  processImageCombined,
  batchProcessImages,
  getProcessingStatus,
  getUserRequests,
  getQueueStats,
  getProcessingResults,
  getInferenceHistory,
  getAllInferenceHistory,
  getInferenceDetails,
  getInferenceStatsSummary,
  startHistoryPolling,
};