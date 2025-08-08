// (em português) Endpoints relacionados com vendedores: lista ativos, atualizar localização e estado.
import { api } from './api';

export async function getActiveVendors() {
  const { data } = await api.get('/vendors/active');
  return data;
}

export async function updateLocation(lat: number, lng: number) {
  return api.post('/vendors/location', { lat, lng });
}

export async function setActive(active: boolean) {
  return api.post('/vendors/active', { active });
}
