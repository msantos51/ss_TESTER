// (em português) Ecrã de recuperação de password (chama endpoint do backend).
import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import { api } from '~/services/api';

export default function ForgotScreen() {
  const [email, setEmail] = useState('');

  async function onSubmit() {
    try {
      await api.post('/auth/forgot', { email });
      Alert.alert('Enviado', 'Verifica o teu email.');
    } catch {
      Alert.alert('Erro', 'Não foi possível enviar.');
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Recuperar Password</Text>
      <TextInput placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 12, borderRadius: 8 }} />
      <Pressable onPress={onSubmit} style={{ backgroundColor: '#ffd700', padding: 14, borderRadius: 12, alignItems: 'center' }}>
        <Text style={{ fontWeight: 'bold' }}>Enviar</Text>
      </Pressable>
    </View>
  );
}
