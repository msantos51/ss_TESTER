// (em português) Ecrã de login do vendedor com chamada ao backend e armazenamento seguro do token.
import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { login } from '~/services/auth';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit() {
    try {
      setLoading(true);
      await login(email, password);
      router.replace('/(vendor)/dashboard');
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Falha no login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Login Vendedor</Text>
      <TextInput placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 12, borderRadius: 8 }} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, padding: 12, borderRadius: 8 }} />
      <Pressable onPress={onSubmit} style={{ backgroundColor: '#ffd700', padding: 14, borderRadius: 12, alignItems: 'center' }}>
        <Text style={{ fontWeight: 'bold' }}>{loading ? 'A entrar...' : 'Entrar'}</Text>
      </Pressable>
      <Pressable onPress={() => router.push('/(auth)/register')}>
        <Text>Não tens conta? Regista-te</Text>
      </Pressable>
    </View>
  );
}
