import apiClient from './apiClient';

const endpoints = {
  presignedUrl: '/storage/presigned-url',
  combinedProcess: '/combined/process',
  combinedStatus: '/combined/status/',
  getCombinedResultByRequest: '/combined/results/request/', 
  getHistoryByUser: '/combined/results?user_id=',
  getAllHistory: '/combined/results?exclude_errors=true',
};

export const getPresignedUrl = async (filename, contentType, userId) => {
  const response = await apiClient.post(endpoints.presignedUrl, {
    filename,
    content_type: contentType,
    user_id: userId,
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

export const processImageCombined = async (imageUrl, metadata) => {
  const requiredFields = ['user_id', 'image_id', 'location'];
  const missingFields = requiredFields.filter(field => !metadata[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Campos obrigatórios faltando no metadata: ${missingFields.join(', ')}`);
  }

  const requestBody = {
    image_url: imageUrl,
    metadata: metadata,
    result_upload_url: metadata.result_upload_url || null
  };

  const response = await apiClient.post(endpoints.combinedProcess, requestBody);
  return response.data;
};

export const getProcessingStatus = async (requestId) => {
  const response = await apiClient.get(`${endpoints.combinedStatus}${requestId}`);
  return response.data;
};

export const getProcessingResults = async (requestId) => {
  const response = await apiClient.get(`${endpoints.getCombinedResultByRequest}${requestId}`);
  const transformedData = transformBackendDataToFrontend([response.data]);
  return transformedData[0]; 
};

export const getInferenceHistory = async (userId, limit = 100) => {
  try {
    const response = await apiClient.get(`${endpoints.getHistoryByUser}${userId}&limit=${limit}`);
    const items = response.data.items || response.data || [];
    return transformBackendDataToFrontend(items);
  } catch (error) {
    console.error('Erro ao buscar histórico do usuário:', error);
    throw error;
  }
};

export const getAllInferenceHistory = async (limit = 50, lastKey = null) => {
  try {
    const params = new URLSearchParams({
      exclude_errors: 'true',
      limit: limit.toString(),
    });

    if (lastKey) {
      params.append('last_key', lastKey);
    }
    
    const response = await apiClient.get(`/combined/results?${params.toString()}`);
    const backendData = response.data;

    const transformedData = transformBackendDataToFrontend(backendData.items || []);

    return {
      items: transformedData,
      nextKey: backendData.next_page_token || null,
      hasMore: backendData.has_more || false,
      totalCount: backendData.total_count || 0,
    };
  } catch (error) {
    console.error('Erro ao buscar histórico geral:', error);
    throw error;
  }
};

const safeParseFloat = (value, defaultValue = 0.0) => {
    const num = parseFloat(value);
    return isNaN(num) ? defaultValue : num;
};

const safeParseInt = (value, defaultValue = 0) => {
    const num = parseInt(value, 10);
    return isNaN(num) ? defaultValue : num;
};

const transformBackendDataToFrontend = (backendData) => {
  if (!Array.isArray(backendData)) {
    backendData = [backendData];
  }

  return backendData.map(item => {
    const detection = item.detection || {};
    const results = detection.results || [];
    const summary = detection.summary || {};
    const procMetadata = item.processing_metadata || {};
    const initialMetadata = item.initial_metadata || {};
    const additionalMeta = item.additional_metadata || {};

    const maturationDist = procMetadata.maturation_distribution || {};
    const maturationCounts = {
      green: safeParseInt(maturationDist.verde, 0),
      ripe: safeParseInt(maturationDist.madura, 0),
      overripe: safeParseInt(maturationDist.passada, 0),
      not_analyzed: safeParseInt(maturationDist.nao_analisado, 0),
    };

    const categoryMap = {
      'verde': 'green',
      'madura': 'ripe', 
      'passada': 'overripe'
    };
    
    return {
      image_id: item.image_id || item.request_id,
      request_id: item.request_id,
      user_id: item.user_id,
      processing_timestamp: item.createdAt || item.updatedAt || new Date().toISOString(),
      location: initialMetadata.location || 'N/A',
      status: item.status === 'success' ? 'completed' : (item.status || 'completed'),
      image_url: item.image_url,
      image_result_url: item.image_result_url,
      thumbnail_url: item.image_url, 
      results: results.map(r => ({
        class_name: r.class_name,
        confidence: safeParseFloat(r.confidence),
        bounding_box: (r.bounding_box || []).map(b => safeParseFloat(b)),
        maturation_level: r.maturation_level ? {
            category: categoryMap[r.maturation_level.category] || r.maturation_level.category,
            score: safeParseFloat(r.maturation_level.score),
            original_category: r.maturation_level.category, // Manter original para debug
        } : null
      })),
      summary: {
        total_objects: safeParseInt(summary.total_objects, results.length),
        objects_with_maturation: safeParseInt(summary.objects_with_maturation, 0),
        average_maturation_score: safeParseFloat(summary.average_maturation_score),
        average_confidence: calculateAverageConfidence(results),
        total_processing_time_ms: safeParseInt(item.processing_time_ms),
        detection_time_ms: safeParseInt(summary.detection_time_ms),
        maturation_analysis_time_ms: safeParseInt(summary.maturation_time_ms),
        maturation_counts: maturationCounts,
        model_versions: summary.model_versions || {},
      },
      metadata: {
        source: additionalMeta.source || 'unknown',
        timestamp: additionalMeta.timestamp,
        device_info: additionalMeta.device_info,
        image_dimensions: procMetadata.image_dimensions,
        environmental: additionalMeta.environmental || {},
        camera_settings: additionalMeta.camera_settings || {},
      },
      backend_data: {
          detection: item.detection,
          processing_metadata: procMetadata,
          initial_metadata: initialMetadata,
          additional_metadata: additionalMeta,
      }
    };
  });
};

const calculateAverageConfidence = (results) => {
  if (!results || results.length === 0) return 0;
  
  const sum = results.reduce((acc, r) => acc + (safeParseFloat(r.confidence) || 0), 0);
  return sum / results.length;
};

export const startHistoryPolling = (userId, callback, intervalSeconds = 30) => {
  const pollHistory = async () => {
    try {
      const data = await getAllInferenceHistory(100);
      callback(null, data.items);
    } catch (error) {
      callback(error, null);
    }
  };

  pollHistory();
  const intervalId = setInterval(pollHistory, intervalSeconds * 1000);
  
  return () => clearInterval(intervalId);
};