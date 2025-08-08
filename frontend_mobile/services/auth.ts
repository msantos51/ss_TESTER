// (em português) Autenticação: login/logout com armazenamento seguro do token.
import * as SecureStore from 'expo-secure-store';
import { api } from './api';

export async function login(email: string, password: string) {
  const { data } = await api.post('/auth/login', { email, password });
  if (data?.access_token) {
    await SecureStore.setItemAsync('auth_token', data.access_token);
  }
  return data;
}

export async function logout() {
  await SecureStore.deleteItemAsync('auth_token');
}
