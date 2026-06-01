import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import api, { BASE_URL } from '../services/api';
import { AuthContext } from '../context/AuthContext';

export default function AccountScreen() {
  const { vendor, logout, token } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState(vendor?.name || '');
  const [email, setEmail] = useState(vendor?.email || '');
  const [product, setProduct] = useState(vendor?.product || '');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(vendor?.profile_photo || null);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        setProfilePhoto(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
    }
  };

  const handleSave = async () => {
    if (!vendor || !token) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('product', product);

      if (profilePhoto && !profilePhoto.startsWith(BASE_URL)) {
        formData.append('profile_photo', {
          uri: profilePhoto,
          name: 'profile.jpg',
          type: 'image/jpeg',
        } as any);
      }

      await api.put(`/vendors/${vendor.id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      Alert.alert('Sucesso', 'Dados atualizados com sucesso');
      setEditing(false);
    } catch (error) {
      console.error('Erro ao salvar:', error);
      Alert.alert('Erro', 'Não foi possível atualizar os dados');
    } finally {
      setSaving(false);
    }
  };

  const photoUrl = profilePhoto?.startsWith('http')
    ? profilePhoto
    : profilePhoto?.startsWith('/')
    ? `${BASE_URL}${profilePhoto}`
    : profilePhoto;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          {photoUrl ? (
            <Image source={{ uri: photoUrl }} style={styles.photo} />
          ) : (
            <View style={[styles.photo, styles.photoPlaceholder]}>
              <Ionicons name="person" size={60} color="#ccc" />
            </View>
          )}
          {editing && (
            <TouchableOpacity style={styles.photoEditButton} onPress={pickImage}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Text style={styles.label}>Nome</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={name}
            onChangeText={setName}
            editable={editing}
            placeholder="Nome"
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={email}
            onChangeText={setEmail}
            editable={editing}
            placeholder="Email"
            keyboardType="email-address"
          />

          <Text style={styles.label}>Produto</Text>
          <TextInput
            style={[styles.input, !editing && styles.inputDisabled]}
            value={product}
            onChangeText={setProduct}
            editable={editing}
            placeholder="Produto"
          />
        </View>

        {/* Subscription Info */}
        {vendor && (
          <View style={styles.subscriptionSection}>
            <View style={styles.subscriptionCard}>
              <View style={styles.subscriptionHeader}>
                <Ionicons name="card" size={24} color="#1976d2" />
                <Text style={styles.subscriptionTitle}>Subscrição</Text>
              </View>
              <View style={styles.subscriptionDetails}>
                <View style={styles.subscriptionRow}>
                  <Text style={styles.subscriptionLabel}>Status</Text>
                  <View style={[styles.statusBadge, { backgroundColor: vendor.subscription_active ? '#e8f5e9' : '#ffebee' }]}>
                    <Text style={[styles.statusText, { color: vendor.subscription_active ? '#4caf50' : '#e74c3c' }]}>
                      {vendor.subscription_active ? 'Ativa' : 'Inativa'}
                    </Text>
                  </View>
                </View>
                {vendor.subscription_valid_until && (
                  <View style={styles.subscriptionRow}>
                    <Text style={styles.subscriptionLabel}>Válida até</Text>
                    <Text style={styles.subscriptionValue}>
                      {new Date(vendor.subscription_valid_until).toLocaleDateString('pt-PT')}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Buttons */}
        <View style={styles.buttonSection}>
          {editing ? (
            <>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="checkmark" size={20} color="#fff" />
                    <Text style={styles.buttonText}>Guardar</Text>
                  </>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => setEditing(false)}
              >
                <Ionicons name="close" size={20} color="#666" />
                <Text style={[styles.buttonText, { color: '#666' }]}>Cancelar</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.button, styles.editButton]}
                onPress={() => setEditing(true)}
              >
                <Ionicons name="create" size={20} color="#fff" />
                <Text style={styles.buttonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.logoutButton]}
                onPress={logout}
              >
                <Ionicons name="log-out" size={20} color="#fff" />
                <Text style={styles.buttonText}>Sair</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  photoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
  },
  photoPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#1976d2',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoSection: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  subscriptionSection: {
    marginBottom: 16,
  },
  subscriptionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  subscriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    color: '#333',
  },
  subscriptionDetails: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
  },
  subscriptionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  subscriptionLabel: {
    fontSize: 14,
    color: '#666',
  },
  subscriptionValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  buttonSection: {
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  editButton: {
    backgroundColor: '#1976d2',
  },
  saveButton: {
    backgroundColor: '#4caf50',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
