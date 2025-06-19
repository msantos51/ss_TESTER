// # Serviço para obter e enviar localização para o backend
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

// # Inicia a partilha da localização em tempo real
export const startLocationSharing = async (vendorId) => {
  if (locationSubscription) return;

  currentVendorId = vendorId;

  // # Pedir permissão de localização ao utilizador
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permissão de localização negada');
  }

  try {
    const token = await getValidToken();

    // # Envia requisição para iniciar trajeto
    await axios.post(`${BASE_URL}/vendors/${vendorId}/routes/start`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // # Começa a partilhar localização a cada X segundos ou X metros
    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 1000,        // Atualiza a cada 1 segundo
        distanceInterval: 1,       // Ou quando se move 1 metro
      },
      async ({ coords }) => {
        try {
          const currentToken = await getValidToken();

          // # Envia nova posição para o backend
          await axios.put(
            `${BASE_URL}/vendors/${vendorId}/location`,
            {
              lat: coords.latitude,
              lng: coords.longitude,
            },
            {
              headers: { Authorization: `Bearer ${currentToken}` },
            }
          );
        } catch (err) {
          console.log('Erro ao enviar localização:', err.response?.data || err.message);
        }
      }
    );

    // # Guarda no AsyncStorage que a partilha está ativa
    await AsyncStorage.setItem('sharingLocation', 'true');
  } catch (err) {
    console.error('Erro ao iniciar partilha de localização:', err.message);
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

      // # Envia requisição para terminar trajeto
      await axios.post(`${BASE_URL}/vendors/${currentVendorId}/routes/stop`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });

      currentVendorId = null;
    } catch (err) {
      console.log('Erro ao terminar trajeto:', err.response?.data || err.message);
    }
  }

  // # Atualiza estado local
  await AsyncStorage.setItem('sharingLocation', 'false');
};

// # Verifica se a partilha de localização está ativa
export const isLocationSharing = async () => {
  const value = await AsyncStorage.getItem('sharingLocation');
  return value === 'true';
};
