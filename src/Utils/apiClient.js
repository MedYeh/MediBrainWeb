// utils/apiClient.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const apiClient = async (endpoint, options = {}) => {
  console.log('Endpoint:', endpoint);
  const token = localStorage.getItem('token');

  // Determine if we're sending FormData
  const isFormData = options.body instanceof FormData;

  // Prepare headers
 const headers = {
    ...((!isFormData && !options.skipJson) ? { 
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    } : {}),
    ...options.headers,
};

  // Normalize URL
  const url = endpoint.startsWith('http')
    ? endpoint
    : `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  // Prepare Axios config
  const config = {
    method: options.method || 'GET',
    url,
    headers,
    data: options.body,
    ...options,
  };

  console.log('Final URL:', url, 'Config:', config);

  try {
    const response = await axios(config);

    if (options.rawResponse) {
      return response;
    }

    return response.data || {};
  } catch (error) {
    console.error('Axios error:', error);

    let errorMessage = `HTTP error! status: ${error.response?.status || 'unknown'}`;
    if (error.response?.data) {
      console.log('Error response body:', error.response.data);
      errorMessage += ` - ${JSON.stringify(error.response.data)}`;
    } else if (error.message) {
      errorMessage += ` - ${error.message}`;
    }

    const newError = new Error(errorMessage);
    newError.response = error.response;
    throw newError;
  }
};

export default apiClient;