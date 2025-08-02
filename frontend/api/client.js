import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_HOST = '10.17.144.25'; // e.g. 192.168.1.37
const client = axios.create({
  baseURL: `http://${API_HOST}:5000/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
client.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default client; 