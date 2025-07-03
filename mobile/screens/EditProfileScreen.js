import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, Platform } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../config';
import { theme } from '../theme';
import BackButton from '../BackButton';

export default function EditProfileScreen({ navigation }) {
  const [vendor, setVendor] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [product, setProduct] = useState('');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadVendor = async () => {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const v = JSON.parse(stored);
        setVendor(v);
        setName(v.name || '');
        setEmail(v.email || '');
        setProduct(v.product || '');
      }
    };
    loadVendor();
  }, []);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProfilePhoto(e.target.files[0]);
    }
  };

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

  const save = async () => {
    if (!vendor) return;
    setSaving(true);
    try {
      const data = new FormData();
      if (name !== vendor.name) data.append('name', name);
      if (email !== vendor.email) data.append('email', email);
      if (product !== vendor.product) data.append('product', product);
      if (profilePhoto) {
        if (Platform.OS === 'web') {
          data.append('profile_photo', profilePhoto);
        } else {
          data.append('profile_photo', {
            uri: profilePhoto.uri,
            name: 'profile.jpg',
            type: 'image/jpeg',
          });
        }
      }
      const token = await AsyncStorage.getItem('token');
      const res = await axios.patch(
        `${BASE_URL}/vendors/${vendor.id}/profile`,
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
        },
      );
      await AsyncStorage.setItem('user', JSON.stringify(res.data));
      navigation.goBack();
    } catch {
      setError('Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const previewUri = profilePhoto
    ? Platform.OS === 'web'
      ? URL.createObjectURL(profilePhoto)
      : profilePhoto.uri
    : vendor && vendor.profile_photo
    ? `${BASE_URL.replace(/\/$/, '')}/${vendor.profile_photo}`
    : null;

  return (
    <View style={styles.container}>
      <BackButton style={styles.back} />
      <Text style={styles.title}>Editar Perfil</Text>
      {previewUri && (
        <Image source={{ uri: previewUri }} style={styles.imagePreview} />
      )}
      {Platform.OS === 'web' ? (
        <input type="file" onChange={handleFileChange} style={{ marginBottom: 12 }} />
      ) : (
        <Button mode="outlined" onPress={pickImage} style={styles.button}>
          <Text>Escolher Foto</Text>
        </Button>
      )}
      <TextInput
        mode="outlined"
        style={styles.input}
        label="Nome"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        mode="outlined"
        style={styles.input}
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <Picker selectedValue={product} onValueChange={setProduct} style={styles.input}>
        <Picker.Item label="Bolas de Berlim" value="Bolas de Berlim" />
        <Picker.Item label="Gelados" value="Gelados" />
        <Picker.Item label="Acessórios" value="Acessórios" />
      </Picker>
      {error && <Text style={styles.error}>{error}</Text>}
      <View style={styles.row}>
        <Button mode="contained" onPress={save} loading={saving}>
          <Text>Guardar</Text>
        </Button>
        <Button mode="outlined" onPress={() => navigation.goBack()}>
          <Text>Cancelar</Text>
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  title: { fontSize: 20, marginBottom: 16, textAlign: 'center' },
  input: { marginBottom: 12 },
  button: { marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  back: { position: 'absolute', top: 16, left: 16 },
  imagePreview: { width: 120, height: 120, borderRadius: 60, alignSelf: 'center', marginBottom: 12 },
  error: { color: 'red', textAlign: 'center', marginBottom: 12 },
});

