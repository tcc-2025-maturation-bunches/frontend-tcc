import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const errorData = error.response.data;
      
      if (errorData.error_code || errorData.error_details) {
        console.error('Erro estruturado:', {
          code: errorData.error_code,
          message: errorData.error_message,
          details: errorData.error_details,
          stage: errorData.error_details?.stage
        });
      } else {
        console.error('API Error:', errorData);
      }
    } else if (error.request) {
      console.error('API Error: No response received', error.request);
    } else {
      console.error('API Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export const getPublicConfig = async () => {
  try {
    const response = await apiClient.get('/status/config');
    return response.data;
  } catch (error) {
    console.error('Erro ao obter configurações públicas:', error);
    return null;
  }
};

export default apiClient;