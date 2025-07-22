// Tela de login do cliente de praia
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import {
  TextInput,
  Button,
  Text,
} from 'react-native-paper';
import LoadingDots from '../LoadingDots';
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

  // JWTs simulados para fluxos de login social de exemplo
  const GOOGLE_TOKEN =
    'eyJhbGciOiJub25lIn0.eyJlbWFpbCI6Im9hdXRoQGV4YW1wbGUuY29tIiwibmFtZSI6Ik9BdXRoIENsaWVudCIsInN1YiI6ImdpZDEyMyJ9.';
  const APPLE_TOKEN =
    'eyJhbGciOiJub25lIn0.eyJlbWFpbCI6Im9hdXRoQGV4YW1wbGUuY29tIiwibmFtZSI6Ik9BdXRoIENsaWVudCIsInN1YiI6ImFpZDEyMyJ9.';

  // getIdFromToken
  const getIdFromToken = (token) => {
    try {
      // payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch (e) {
      console.error('Erro ao decodificar token:', e);
      return null;
    }
  };

  // login
  const login = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      // resp
      const resp = await axios.post(`${BASE_URL}/client-token`, {
        email,
        password,
      });
      // token
      const token = resp.data.access_token;
      await AsyncStorage.setItem('clientToken', token);
      // clientId
      const clientId = getIdFromToken(token);
      let client = { id: clientId, email };
      if (clientId) {
        try {
          // details
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

  // Efetua login social simulando um token JWT válido
  const oauthLogin = async (provider) => {
    const token = provider === 'google' ? GOOGLE_TOKEN : APPLE_TOKEN;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('provider', provider);
      params.append('token', token);
      const resp = await axios.post(
        `${BASE_URL}/client-oauth`,
        params
      );
      const access = resp.data.access_token;
      await AsyncStorage.setItem('clientToken', access);
      const clientId = getIdFromToken(access);
      let client = { id: clientId };
      if (clientId) {
        const details = await axios.get(`${BASE_URL}/clients/${clientId}`);
        client = details.data;
      }
      await AsyncStorage.setItem('client', JSON.stringify(client));
      navigation.navigate('ClientDashboard');
    } catch (err) {
      console.error(err);
      setError('Falha no login social');
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
        <LoadingDots />
      ) : (
        <Button mode="contained" onPress={login} disabled={!email || !password}>
          <Text>Entrar</Text>
        </Button>
      )}
      <View style={{ marginTop: 12 }} />
      <Button mode="outlined" onPress={() => navigation.navigate('ClientRegister')}>
        <Text>Registar</Text>
      </Button>

      <View style={styles.socialButtons}>
        <Button
          mode="outlined"
          icon="google"
          onPress={() => oauthLogin('google')}
=======
          onPress={() =>
            Alert.alert('Login com Google', 'Funcionalidade em desenvolvimento')
          }

        >
          <Text>Entrar com Google</Text>
        </Button>
        <View style={{ marginTop: 8 }} />
        <Button
          mode="outlined"
          icon="apple"

        >
          <Text>Entrar com Apple</Text>
        </Button>
      </View>
    </View>
  );
}

// styles
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: theme.colors.background },
  input: { marginBottom: 12 },
  error: { color: 'red', marginBottom: 12, textAlign: 'center' },
  back: { position: 'absolute', top: 16, left: 16 },
  socialButtons: { marginTop: 20 },
});
