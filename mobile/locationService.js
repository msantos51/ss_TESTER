// locationService.js - atualizado para evitar reaparecimento indevido no mapa

import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from './config';

let locationSubscription = null;
let currentVendorId = null;

// # Função auxiliar para garantir que o token JWT está disponível
const getValidToken = async () => {
  const token = await AsyncStorage.getItem('token');
  if (!token) throw new Error('Token não encontrado. Sessão pode ter expirado.');
  return token;
};

// ⚠️ Nova variável para bloquear chamadas múltiplas
let isStarting = false;

export const startLocationSharing = async (vendorId) => {
  if (locationSubscription || isStarting) return;
  isStarting = true;

  currentVendorId = vendorId;

  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    isStarting = false;
    throw new Error('Permissão de localização negada');
  }

  try {
    const token = await getValidToken();

    await axios.post(`${BASE_URL}/vendors/${vendorId}/routes/start`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });

    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 1000,
        distanceInterval: 1,
      },
      async ({ coords }) => {
        try {
          const currentToken = await getValidToken();
          await axios.put(
            `${BASE_URL}/vendors/${vendorId}/location`,
            { lat: coords.latitude, lng: coords.longitude },
            { headers: { Authorization: `Bearer ${currentToken}` } }
          );
        } catch (err) {
          console.log('Erro ao enviar localização:', err.response?.data || err.message);
        }
      }
    );

    await AsyncStorage.setItem('sharingLocation', 'true');
  } catch (err) {
    console.error('Erro ao iniciar partilha de localização:', err.message);
  } finally {
    isStarting = false;
  }
};

// # Para a partilha da localização
export const stopLocationSharing = async () => {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }

  if (currentVendorId) {
    try {
      const token = await getValidToken();
      await axios.post(`${BASE_URL}/vendors/${currentVendorId}/routes/stop`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.log('Erro ao terminar trajeto:', err.response?.data || err.message);
    }
    currentVendorId = null;
  }

  await AsyncStorage.setItem('sharingLocation', 'false');
};

// # Verifica se a partilha de localização está ativa
export const isLocationSharing = async () => {
  const value = await AsyncStorage.getItem('sharingLocation');
  return value === 'true';
};