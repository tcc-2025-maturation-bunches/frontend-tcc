import apiClient from './apiClient';

const endpoints = {
  presignedUrl: '/storage/presigned-url',
  processImage: '/combined/process',
  getResults: '/combined/results/',
  getStatus: '/combined/status/',
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
  
  return response;
};

export const processImage = async (imageUrl, userId, performMaturation = true, metadata = null, location = null) => {
  const response = await apiClient.post(endpoints.processImage, {
    image_url: imageUrl,
    user_id: userId,
    perform_maturation: performMaturation,
    metadata,
    location,
  });
  return response.data;
};

export const getProcessingStatus = async (requestId) => {
  const response = await apiClient.get(`${endpoints.getStatus}${requestId}`);
  return response.data;
};

export const getProcessingResults = async (requestId) => {
  const response = await apiClient.get(`${endpoints.getResults}request/${requestId}`);
  return response.data;
};

export const getInferenceHistory = async (userId, limit = 10) => {
  const response = await apiClient.get(`${endpoints.getHistoryByUser}${userId}?limit=${limit}`);
  return response.data;
};
