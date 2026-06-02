import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';
import Constants from 'expo-constants';
import { AuthContext } from '../context/AuthContext';
import api, { BASE_URL } from '../services/api';

const WEB_URL: string =
  (Constants.expoConfig?.extra?.EXPO_PUBLIC_WEB_URL as string) || BASE_URL;

let watchId: Location.LocationSubscription | null = null;

export default function HomeScreen() {
  const { vendor, logout, token } = useContext(AuthContext);
  const [sharing, setSharing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!vendor || !token) return;
    api
      .get(`/vendors/${vendor.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => setSharing(res.data?.is_currently_sharing || false))
      .catch(() => {});
  }, [vendor, token]);

  const startSharing = useCallback(async () => {
    if (!vendor || !token) return;
    setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/vendors/${vendor.id}/routes/start`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erro', 'Permissão de localização negada');
        setLoading(false);
        return;
      }

      watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        async (position) => {
          try {
            await axios.put(
              `${BASE_URL}/vendors/${vendor.id}/location`,
              {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch {
            // location update errors are non-fatal
          }
        }
      );

      setSharing(true);
    } catch {
      Alert.alert('Erro', 'Não foi possível iniciar a partilha de localização');
    } finally {
      setLoading(false);
    }
  }, [vendor, token]);

  const stopSharing = useCallback(async () => {
    if (!vendor || !token) return;
    setLoading(true);
    try {
      if (watchId) {
        watchId.remove();
        watchId = null;
      }
      await axios.post(
        `${BASE_URL}/vendors/${vendor.id}/routes/stop`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSharing(false);
    } catch {
      Alert.alert('Erro', 'Erro ao parar a partilha');
    } finally {
      setLoading(false);
    }
  }, [vendor, token]);

  const handleToggle = () => {
    if (sharing) stopSharing();
    else startSharing();
  };

  const firstName = vendor?.name?.split(' ')[0] ?? 'Vendedor';

  return (
    <View style={styles.container}>
      <Text style={styles.appName}>Sunny Sales</Text>
      <Text style={styles.greeting}>Olá, {firstName}</Text>

      <View style={[styles.card, sharing && styles.cardActive]}>
        <View style={styles.cardRow}>
          <Ionicons
            name="location"
            size={28}
            color={sharing ? '#4caf50' : '#999'}
          />
          <View style={styles.cardText}>
            <Text style={styles.cardTitle}>Partilhar Localização</Text>
            <Text style={[styles.cardStatus, { color: sharing ? '#4caf50' : '#999' }]}>
              {sharing ? 'Ativo — visível no mapa' : 'Desligado'}
            </Text>
          </View>
          {loading ? (
            <ActivityIndicator color="#1976d2" />
          ) : (
            <Switch
              value={sharing}
              onValueChange={handleToggle}
              trackColor={{ false: '#ccc', true: '#81c784' }}
              thumbColor={sharing ? '#4caf50' : '#f0f0f0'}
            />
          )}
        </View>
      </View>

      <TouchableOpacity
        style={styles.webButton}
        onPress={() => Linking.openURL(WEB_URL)}
      >
        <Ionicons name="globe-outline" size={20} color="#fff" style={styles.buttonIcon} />
        <Text style={styles.webButtonText}>Abrir Website</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <Ionicons name="log-out-outline" size={20} color="#e74c3c" style={styles.buttonIcon} />
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  appName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1976d2',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  greeting: {
    fontSize: 32,
    fontWeight: '700',
    color: '#333',
    marginBottom: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ccc',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  cardActive: {
    borderLeftColor: '#4caf50',
    backgroundColor: '#f1f8f4',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardText: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  cardStatus: {
    fontSize: 13,
  },
  webButton: {
    backgroundColor: '#1976d2',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  webButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e74c3c',
  },
  logoutText: {
    color: '#e74c3c',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginRight: 8,
  },
});
