import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common.Authorization;
  }
};

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwtToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 400 && error.response?.data) {
      const validationErrors = error.response.data;
      
      if (typeof validationErrors === 'object' && validationErrors !== null) {
        const formattedErrors = [];
        
        for (const [field, messages] of Object.entries(validationErrors)) {
          if (Array.isArray(messages)) {
            formattedErrors.push(`${field}: ${messages.join(', ')}`);
          } else if (typeof messages === 'string') {
            formattedErrors.push(`${field}: ${messages}`);
          }
        }
        
        if (formattedErrors.length > 0) {
          error.formattedValidationErrors = formattedErrors;
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;