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

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      const tokenRes = await axios.post(`${BASE_URL}/token`, {
        email,
        password,
      });
      await AsyncStorage.setItem('token', tokenRes.data.access_token);

      const userRes = await axios.post(`${BASE_URL}/login`, {
        email,
        password,
      });

      await AsyncStorage.setItem('user', JSON.stringify(userRes.data));
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
      {error && <Text style={styles.error}>{error}</Text>}

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
        label="Password"
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
        <Button mode="contained" onPress={login} disabled={!email || !password}
        >Entrar</Button>
      )}

      <View style={{ marginTop: 12 }} />
      <Button mode="outlined" onPress={() => navigation.navigate('Register')}>
        Registar
      </Button>
      <View style={{ marginTop: 12 }} />
      <Button
        mode="text"
        onPress={() => navigation.navigate('ForgotPassword')}
      >
        Esqueci a minha password
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: theme.colors.background },
  input: { marginBottom: 12 },
  error: { color: 'red', marginBottom: 12, textAlign: 'center' },
});
