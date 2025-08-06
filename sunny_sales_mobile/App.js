import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { BASE_URL } from './src/config';
import VendorRegister from './VendorRegister';

export default function App() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(null);
  const [vendorId, setVendorId] = useState(null);
  const [watcher, setWatcher] = useState(null);
  const [error, setError] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  const decodeId = (t) => {
    try {
      const payload = JSON.parse(atob(t.split('.')[1]));
      return payload.sub;
    } catch {
      return null;
    }
  };

  const attemptLogin = async (force = false) => {
    const payload = { email, password };
    if (force) payload.force = true;
    const resp = await axios.post(`${BASE_URL}/token`, payload);
    const tok = resp.data.access_token;
    setToken(tok);
    setVendorId(decodeId(tok));
  };

  const login = async () => {
    try {
      await attemptLogin();
    } catch (e) {
      if (e.response?.status === 409) {
        Alert.alert(
          'Sessão ativa',
          'Já existe uma sessão ativa. Terminar sessão anterior?',
          [
            { text: 'Não', style: 'cancel' },
            {
              text: 'Sim',
              onPress: async () => {
                try {
                  await attemptLogin(true);
                } catch {
                  setError('Falha no login');
                }
              },
            },
          ],
          { cancelable: true }
        );
      } else {
        setError('Falha no login');
      }
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
    const intervalId = setInterval(async () => {
      try {
        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const { latitude, longitude } = coords;
        await axios
          .put(
            `${BASE_URL}/vendors/${vendorId}/location`,
            { lat: latitude, lng: longitude },
            { headers: { Authorization: `Bearer ${token}` } }
          )
          .catch(() => {});
      } catch {
        // ignore errors retrieving location
      }
    }, 1000);

    setWatcher({ remove: () => clearInterval(intervalId) });
  };

  return (
    <View style={styles.container}>
      {showRegister ? (
        <VendorRegister onBack={() => setShowRegister(false)} />
      ) : !token ? (
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
          <Button title="Registar" onPress={() => setShowRegister(true)} />
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
  title: { fontSize: 20, marginBottom: 20, color: '#fdc500' },
  input: { borderWidth: 1, marginBottom: 10, padding: 8 },
  error: { color: 'red', marginTop: 10 },
});
