import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_HOST = '172.20.10.2'; // replace with your LAN IP if different
const api = axios.create({ baseURL: `http://${API_HOST}:3001/api` });

// Attach Authorization header if token exists
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
