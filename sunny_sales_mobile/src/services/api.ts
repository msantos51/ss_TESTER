import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

/**
 * URL base do backend.
 * Vai buscar ao app.json -> extra.EXPO_PUBLIC_BASE_URL
 */
export const BASE_URL =
  Constants.expoConfig?.extra?.EXPO_PUBLIC_BASE_URL || "https://ss-tester.onrender.com";

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
  const token = await AsyncStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem("token");
    }
    return Promise.reject(error);
  }
);

export default api;
