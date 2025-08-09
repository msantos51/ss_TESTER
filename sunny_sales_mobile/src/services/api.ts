// src/services/api.ts
import axios from 'axios';
import { BASE_URL } from '@/config';

export const api = axios.create({ baseURL: BASE_URL, timeout: 15000 });

api.interceptors.request.use((config) => {
  // Nota: no mobile vamos usar SecureStore depois; por agora fica simples
  const token = (global as any).__VENDOR_TOKEN__;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
