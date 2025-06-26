// Tela de login do cliente de praia
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../config';
import { theme } from '../theme';
import BackButton from '../BackButton';

export default function ClientLoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const getIdFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch (e) {
      console.error('Erro ao decodificar token:', e);
      return null;
    }
  };

  const login = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.post(`${BASE_URL}/client-token`, {
        email,
        password,
      });
      const token = resp.data.access_token;
      await AsyncStorage.setItem('clientToken', token);
      const clientId = getIdFromToken(token);
      let client = { id: clientId, email };
      if (clientId) {
        try {
          const details = await axios.get(`${BASE_URL}/clients/${clientId}`);
          client = details.data;
        } catch (e) {
          console.log('Erro ao obter cliente:', e);
        }
      }
      await AsyncStorage.setItem('client', JSON.stringify(client));
      navigation.navigate('ClientDashboard');
    } catch (err) {
      console.error(err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Falha no login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <BackButton style={styles.back} />
      {error && <Text style={styles.error}>{error}</Text>}
      <TextInput
        mode="outlined"
        style={styles.input}
        label="Email"
        value={email}
        onChangeText={(t) => {
          setEmail(t);
          setError(null);
        }}
        autoCapitalize="none"
      />
      <TextInput
        mode="outlined"
        style={styles.input}
        label="Palavra-passe"
        secureTextEntry
        value={password}
        onChangeText={(t) => {
          setPassword(t);
          setError(null);
        }}
      />
      {loading ? (
        <ActivityIndicator animating size="large" />
      ) : (
        <Button mode="contained" onPress={login} disabled={!email || !password}>
          <Text>Entrar</Text>
        </Button>
      )}
      <View style={{ marginTop: 12 }} />
      <Button mode="outlined" onPress={() => navigation.navigate('ClientRegister')}>
        <Text>Registar</Text>
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: theme.colors.background },
  input: { marginBottom: 12 },
  error: { color: 'red', marginBottom: 12, textAlign: 'center' },
  back: { position: 'absolute', top: 16, left: 16 },
});
