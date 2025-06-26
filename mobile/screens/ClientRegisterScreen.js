// Tela de registo de clientes
import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { BASE_URL } from '../config';
import { theme } from '../theme';
import BackButton from '../BackButton';

export default function ClientRegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled && result.assets.length > 0) {
      setProfilePhoto(result.assets[0]);
    }
  };

  const register = async () => {
    if (!name || !email || !password) {
      setError('Preencha todos os campos obrigatórios');
      return;
    }
    if (password.length < 8 || password.toLowerCase() === password) {
      setError('Palavra-passe deve ter 8 caracteres e uma letra maiúscula');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = new FormData();
      data.append('name', name);
      data.append('email', email);
      data.append('password', password);
      if (profilePhoto) {
        data.append('profile_photo', {
          uri: profilePhoto.uri,
          name: 'profile.jpg',
          type: 'image/jpeg',
        });
      }
      await axios.post(`${BASE_URL}/clients/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      Alert.alert('Registo efetuado', 'Verifique o seu e-mail para confirmar a conta.');
      navigation.navigate('ClientLogin');
    } catch (err) {
      console.error('Erro no registo:', err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Ocorreu um erro ao registar.');
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
        label="Nome"
        value={name}
        onChangeText={(t) => {
          setName(t);
          setError(null);
        }}
      />
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
      <Button mode="outlined" onPress={pickImage}>
        <Text>Escolher Foto de Perfil</Text>
      </Button>
      {profilePhoto && (
        <Image source={{ uri: profilePhoto.uri }} style={styles.imagePreview} />
      )}
      <View style={{ marginTop: 12 }} />
      {loading ? (
        <ActivityIndicator animating size="large" />
      ) : (
        <Button mode="contained" onPress={register}>
          <Text>Registar</Text>
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: theme.colors.background },
  input: { marginBottom: 12 },
  error: { color: 'red', marginBottom: 12, textAlign: 'center' },
  imagePreview: {
    width: 100,
    height: 100,
    marginVertical: 12,
    borderRadius: 50,
    alignSelf: 'center',
  },
  back: { position: 'absolute', top: 16, left: 16 },
});
