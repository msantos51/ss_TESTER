import React from 'react';
import { View, Button } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../services/api';

export default function Profile() {
  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
    });
    if (!result.canceled) {
      const form = new FormData();
      form.append('file', {
        uri: result.assets[0].uri,
        name: 'avatar.jpg',
        type: 'image/jpeg',
      } as any);
      await api.post('/users/me/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    }
  }

  return (
    <View>
      <Button title="Escolher imagem" onPress={pickImage} />
    </View>
  );
}
