import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleLogin() {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      await AsyncStorage.setItem('token', data.access_token);
      navigation.replace('Home');
    } catch {
      Alert.alert('Erro', 'Credenciais inválidas.');
    }
  }

  return (
    <View>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Senha" value={password} secureTextEntry onChangeText={setPassword} />
      <Button title="Entrar" onPress={handleLogin} />
    </View>
  );
}
