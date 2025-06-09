import apiClient from './apiClient';

const endpoints = {
  presignedUrl: '/storage/presigned-url',
  presignedResultUrl: '/storage/presigned-result-url',
  
  combinedProcess: '/combined/process',
  combinedStatus: '/combined/status/',
  combinedResults: '/combined/results/request/',
  
  getHistoryByUser: '/storage/results/user/',
  
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

  console.log('Request Body for Combined Process:', requestBody);

  const response = await apiClient.post(endpoints.combinedProcess, requestBody);
  return response.data;
};

export const getProcessingStatus = async (requestId) => {
  const response = await apiClient.get(`${endpoints.combinedStatus}${requestId}`);
  return response.data;
};

export const getProcessingResults = async (requestId) => {
  const response = await apiClient.get(`${endpoints.combinedResults}${requestId}`);
  return response.data;
};

export const getInferenceHistory = async (userId, limit = 10) => {
  try {
    const response = await apiClient.get(`${endpoints.getHistoryByUser}${userId}?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    throw error;
  }
};
