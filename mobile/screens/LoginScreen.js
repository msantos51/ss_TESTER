// Tela de login do utilizador
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../config';
import { theme } from '../theme';
import BackButton from '../BackButton';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // # Função para decodificar o token e obter o vendorId
  const getVendorIdFromToken = (token) => {
    try {
      // payload
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch (e) {
      console.error('Erro ao decodificar o token:', e);
      return null;
    }
  };

  // login
  const login = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      // # Obter o token
      const tokenRes = await axios.post(`${BASE_URL}/token`, {
        email,
        password,
      });
      // token
      const token = tokenRes.data.access_token;

      // # Guardar o token
      await AsyncStorage.setItem('token', token);

      // # Extrair e guardar o vendorId do token
      const vendorId = getVendorIdFromToken(token);
      if (vendorId) {
        await AsyncStorage.setItem('vendorId', vendorId.toString());
      }

      // # Obter dados do utilizador (nome, produto, etc.)
      const userRes = await axios.post(`${BASE_URL}/login`, {
        email,
        password,
      });
      await AsyncStorage.setItem('user', JSON.stringify(userRes.data));

      // # Navegar para o dashboard
      navigation.navigate('Dashboard');
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
      <Text style={styles.notice}>Esta página destina-se apenas a vendedores.</Text>

      <TextInput
        mode="outlined"
        style={styles.input}
        label="Email"
        value={email}
        onChangeText={(text) => {
          setEmail(text);
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
        onChangeText={(text) => {
          setPassword(text);
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
        <Button mode="outlined" onPress={() => navigation.navigate('VendorRegister')}>
          <Text>Registar</Text>
        </Button>
      <View style={{ marginTop: 12 }} />
        <Button
          mode="text"
          onPress={() => navigation.navigate('ForgotPassword')}
        >
          <Text>Esqueci-me da palavra-passe</Text>
        </Button>
    </View>
  );
}

// styles
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: theme.colors.background },
  input: { marginBottom: 12 },
  error: { color: 'red', marginBottom: 12, textAlign: 'center' },
  notice: { marginBottom: 12, textAlign: 'center' },
  back: { position: 'absolute', top: 16, left: 16 },
});
