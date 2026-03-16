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

const existingToken = localStorage.getItem('jwtToken');
if (existingToken) {
  setAuthToken(existingToken);
}

export default apiClient;

