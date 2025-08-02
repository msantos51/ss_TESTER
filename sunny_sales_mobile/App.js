import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { BASE_URL } from './src/config';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);
  const [vendorId, setVendorId] = useState(null);
  const [watcher, setWatcher] = useState(null);
  const [error, setError] = useState(null);

  const decodeId = (t) => {
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      return payload.sub;
    } catch {
      return null;
    }
  };

  const login = async () => {
    try {
      const resp = await axios.post(`${BASE_URL}/token`, { email, password });
      const tok = resp.data.access_token;
      setToken(tok);
      setVendorId(decodeId(tok));
    } catch (e) {
      setError('Falha no login');
    }
  };

  useEffect(() => {
    return () => {
      if (watcher) watcher.remove();
    };
  }, [watcher]);

  const startSharing = async () => {
    if (!vendorId || !token) return;
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('Permissão de localização negada');
      return;
    }
    const { status: bg } = await Location.requestBackgroundPermissionsAsync();
    if (bg !== 'granted') {
      setError('Permissão de localização em background negada');
      return;
    }
    const watcherSub = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 5,
      },
      (location) => {
        const { latitude, longitude } = location.coords;
        axios.put(
          `${BASE_URL}/vendors/${vendorId}/location`,
          { lat: latitude, lng: longitude },
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(() => {});
      }
    );
    setWatcher(watcherSub);
  };

  return (
    <View style={styles.container}>
      {!token ? (
        <>
          <Text style={styles.title}>Login do Vendedor</Text>
          <TextInput
            placeholder="Email"
            style={styles.input}
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder="Password"
            style={styles.input}
            value={password}
            secureTextEntry
            onChangeText={setPassword}
          />
          <Button title="Entrar" onPress={login} />
          {error && <Text style={styles.error}>{error}</Text>}
        </>
      ) : (
        <>
          <Text style={styles.title}>Partilha de localização ativa</Text>
          <Button title="Iniciar" onPress={startSharing} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { fontSize: 20, marginBottom: 20 },
  input: { borderWidth: 1, marginBottom: 10, padding: 8 },
  error: { color: 'red', marginTop: 10 },
});
