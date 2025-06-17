// Servico para obter e enviar localizacao para o backend
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from './config';

let locationSubscription = null;
let currentVendorId = null;

export const startLocationSharing = async (vendorId) => {
  if (locationSubscription) {
    return;
  }
  currentVendorId = vendorId;
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permissão de localização negada');
  }
  const token = await AsyncStorage.getItem('token');
  axios
    .post(`${BASE_URL}/vendors/${vendorId}/routes/start`, null, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    .catch((err) => console.log('Erro ao iniciar trajeto:', err));
  locationSubscription = await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 10000,
      distanceInterval: 10,
    },
    ({ coords }) => {
      AsyncStorage.getItem('token').then((token) => {
        axios
          .put(
            `${BASE_URL}/vendors/${vendorId}/location`,
            {
              lat: coords.latitude,
              lng: coords.longitude,
            },
            {
              headers: token ? { Authorization: `Bearer ${token}` } : {},
            }
          )
          .catch((err) => console.log('Erro ao enviar localização:', err));
      });
    }
  );
  await AsyncStorage.setItem('sharingLocation', 'true');
};

export const stopLocationSharing = async () => {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
  }
  if (currentVendorId) {
    const token = await AsyncStorage.getItem('token');
    axios
      .post(`${BASE_URL}/vendors/${currentVendorId}/routes/stop`, null, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      })
      .catch((err) => console.log('Erro ao terminar trajeto:', err));
    currentVendorId = null;
  }
  await AsyncStorage.setItem('sharingLocation', 'false');
};

export const isLocationSharing = async () => {
  const value = await AsyncStorage.getItem('sharingLocation');
  return value === 'true';
};
