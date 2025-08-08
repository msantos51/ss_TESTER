// (em português) Ecrã de registo com upload opcional de foto (pré-estrutura).
import { useState } from 'react';
import { View, Text, TextInput, Pressable, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { api } from '~/services/api';
import { router } from 'expo-router';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [product, setProduct] = useState('Bolas de Berlim');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  async function pickPhoto() {
    const res = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.8 });
    if (!res.canceled) setPhotoUri(res.assets[0].uri);
  }

  async function onSubmit() {
    try {
      const form = new FormData();
      form.append('name', name);
      form.append('email', email);
      form.append('password', password);
      form.append('product', product);
      if (photoUri) {
        // @ts-ignore
        form.append('photo', { uri: photoUri, name: 'photo.jpg', type: 'image/jpeg' });
      }
      await api.post('/auth/register', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      Alert.alert('Sucesso', 'Conta criada. Faz login.');
      router.replace('/(auth)/login');
    } catch (e: any) {
      Alert.alert('Erro', e?.message ?? 'Falha no registo');
    }
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Registo Vendedor</Text>
      <TextInput placeholder="Nome" value={name} onChangeText={setName} style={{ borderWidth: 1, padding: 12, borderRadius: 8 }} />
      <TextInput placeholder="Email" autoCapitalize="none" value={email} onChangeText={setEmail} style={{ borderWidth: 1, padding: 12, borderRadius: 8 }} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={{ borderWidth: 1, padding: 12, borderRadius: 8 }} />
      <Pressable onPress={pickPhoto} style={{ backgroundColor: '#eee', padding: 12, borderRadius: 8 }}>
        <Text>{photoUri ? 'Foto selecionada ✅' : 'Selecionar foto'}</Text>
      </Pressable>
      <Pressable onPress={onSubmit} style={{ backgroundColor: '#ffd700', padding: 14, borderRadius: 12, alignItems: 'center' }}>
        <Text style={{ fontWeight: 'bold' }}>Criar conta</Text>
      </Pressable>
    </View>
  );
}
