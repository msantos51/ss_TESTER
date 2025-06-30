// Tela de registo de novos vendedores
import React, { useState } from 'react';
import { View, StyleSheet, Image, Alert } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { BASE_URL } from '../config';
import { theme } from '../theme';

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [product, setProduct] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // pickImage
  const pickImage = async () => {
    // result
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      setProfilePhoto(result.assets[0]);
    }
  };

  // register
  const register = async () => {
    if (!name || !email || !password || !product) {
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
      // data
      const data = new FormData();
      data.append('name', name);
      data.append('email', email);
      data.append('password', password);
      data.append('product', product);

      if (profilePhoto) {
        data.append('profile_photo', {
          uri: profilePhoto.uri,
          name: 'profile.jpg',
          type: 'image/jpeg',
        });
      }

      await axios.post(`${BASE_URL}/vendors/`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert(
        'Registo efetuado',
        'Verifique o seu e-mail para confirmar a conta.'
      );
      navigation.navigate('VendorLogin');
    } catch (err) {
      console.error("Erro no registo:", err);

      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else if (typeof err.response?.data === 'string') {
        setError(err.response.data);
      } else {
        setError('Ocorreu um erro ao registar.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {error && <Text style={styles.error}>{error}</Text>}
      <Text style={styles.notice}>Esta página destina-se apenas a vendedores.</Text>

      <TextInput
        mode="outlined"
        style={styles.input}
        label="Nome"
        value={name}
        onChangeText={(text) => {
          setName(text);
          setError(null);
        }}
      />

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

      <Picker
        selectedValue={product}
        onValueChange={(itemValue) => {
          setProduct(itemValue);
          setError(null);
        }}
        style={styles.input}
      >
        <Picker.Item label="Selecione um produto" value="" />
        <Picker.Item label="Bolas de Berlim" value="Bolas de Berlim" />
        <Picker.Item label="Gelados" value="Gelados" />
        <Picker.Item label="Acessórios" value="Acessórios" />
      </Picker>


      <Button mode="outlined" onPress={pickImage}>
        <Text>Escolher Foto de Perfil</Text>
      </Button>

      {profilePhoto && (
        <Image
          source={{ uri: profilePhoto.uri }}
          style={styles.imagePreview}
        />
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

// styles
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: theme.colors.background },
  input: { marginBottom: 12 },
  error: { color: 'red', marginBottom: 12, textAlign: 'center' },
  notice: { marginBottom: 12, textAlign: 'center' },
  imagePreview: {
    width: 100,
    height: 100,
    marginVertical: 12,
    borderRadius: 50,
    alignSelf: 'center',
  },
  // estilos removidos de seleção de cor do pin
});
