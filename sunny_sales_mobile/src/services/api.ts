import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * URL base do backend.
 * Pode ser definida através da variável de ambiente `EXPO_PUBLIC_BASE_URL`.
 */
export const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL || 'http://localhost:8000';

/**
 * Instância do axios configurada com a URL base.
 */
const api = axios.create({
  baseURL: BASE_URL,
});

/**
 * Intercetores que adicionam o token JWT a cada pedido e tratam respostas não autorizadas.
 */
api.interceptors.request.use(async (config) => {
  // Recupera o token armazenado localmente
  const token = await AsyncStorage.getItem('token');
  if (token && config.headers) {
    // Define o cabeçalho Authorization com o token JWT
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Em caso de não autorização, remove o token armazenado
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export default api;
