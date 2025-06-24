// Dashboard do vendedor
import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  Linking,
  ScrollView,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { BASE_URL } from '../config';
import { theme } from '../theme';
import t from '../i18n';
import {
  startLocationSharing,
  stopLocationSharing,
  isLocationSharing,
} from '../locationService';

export default function DashboardScreen({ navigation }) {
  const [vendor, setVendor] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [product, setProduct] = useState('');
  const [pinColor, setPinColor] = useState('#FFB6C1');
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [error, setError] = useState(null);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reviews, setReviews] = useState([]);

  const colorOptions = [
    '#FFB6C1', '#ADD8E6', '#90EE90', '#FFFF99',
    '#C8A2C8', '#98E8D5', '#FFCC99', '#E6E6FA',
  ];

  useEffect(() => {
    const loadVendor = async () => {
      try {
        const stored = await AsyncStorage.getItem('user');
        if (stored) {
          const v = JSON.parse(stored);
          setVendor(v);
          setName(v.name);
          setEmail(v.email);
          setProduct(v.product);
          setPinColor(v.pin_color || '#FFB6C1');
          fetchVendorFromServer(v.id);
          fetchReviews(v.id);

          const share = await isLocationSharing();
          if (share) {
            await startLocationSharing(v.id);
            setSharingLocation(true);
          } else {
            setSharingLocation(false);
          }
        } else {
          setError('Utilizador não encontrado.');
        }
      } catch (e) {
        console.log('Erro ao carregar vendor:', e);
        setError('Erro ao carregar dados do utilizador');
      }
    };

    loadVendor();
    const unsubscribe = navigation.addListener('focus', () => {
      if (vendor?.id) {
        fetchVendorFromServer(vendor.id);
        fetchReviews(vendor.id);
      }
    });
    return unsubscribe;
  }, [navigation, vendor?.id]);

  const fetchVendorFromServer = async (vendorId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.get(`${BASE_URL}/vendors/`, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      const updated = res.data.find((v) => v.id === vendorId);
      if (updated) {
        await AsyncStorage.setItem('user', JSON.stringify(updated));
        setVendor(updated);
        setName(updated.name);
        setEmail(updated.email);
        setProduct(updated.product);
        setPinColor(updated.pin_color || '#FFB6C1');
      }
    } catch (err) {
      console.log('Erro ao atualizar vendedor:', err);
    }
  };

  const fetchReviews = async (vendorId) => {
    try {
      const resp = await axios.get(`${BASE_URL}/vendors/${vendorId}/reviews`);
      setReviews(resp.data);
    } catch (e) {
      console.log('Erro ao carregar reviews:', e);
    }
  };

  const logout = async () => {
    await stopLocationSharing();
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
    navigation.replace('VendorLogin');
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

  const updateProfile = async () => {
    if (!vendor) return;
    if (changingPassword && (!password || !oldPassword)) {
      setError('Preencha as palavras-passe');
      return;
    }
    try {
      const data = new FormData();
      if (name !== vendor.name) data.append('name', name);
      if (email !== vendor.email) data.append('email', email);
      if (changingPassword && password) {
        data.append('new_password', password);
        data.append('old_password', oldPassword);
      }
      if (product !== vendor.product) data.append('product', product);
      if (pinColor !== (vendor.pin_color || '#FFB6C1')) data.append('pin_color', pinColor);
      if (profilePhoto) {
        data.append('profile_photo', {
          uri: profilePhoto.uri,
          name: 'profile.jpg',
          type: 'image/jpeg',
        });
      }
      const token = await AsyncStorage.getItem('token');
      const response = await axios.patch(`${BASE_URL}/vendors/${vendor.id}/profile`, data, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: token ? `Bearer ${token}` : undefined,
        },
      });
      await AsyncStorage.setItem('user', JSON.stringify(response.data));
      setVendor(response.data);
      setName(response.data.name);
      setEmail(response.data.email);
      setProduct(response.data.product);
      setPinColor(response.data.pin_color || '#FFB6C1');
      setPassword('');
      setOldPassword('');
      setChangingPassword(false);
      setProfilePhoto(null);
      setEditing(false);
      setError(null);
    } catch (err) {
      console.error('Erro ao atualizar:', err);
      setError(err.response?.data?.detail || err.message || 'Falha ao atualizar');
    }
  };

  const toggleLocation = async () => {
    if (!vendor) return;
    if (sharingLocation) {
      await stopLocationSharing();
      setSharingLocation(false);
    } else {
      try {
        await startLocationSharing(vendor.id);
        setSharingLocation(true);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const paySubscription = async () => {
    if (!vendor) return;
    try {
      const token = await AsyncStorage.getItem('token');
      const res = await axios.post(`${BASE_URL}/vendors/${vendor.id}/create-checkout-session`, null, {
        headers: { Authorization: token ? `Bearer ${token}` : undefined },
      });
      if (res.data.checkout_url) {
        Linking.openURL(res.data.checkout_url);
      }
    } catch (err) {
      console.error('Erro no pagamento:', err);
      setError(err.response?.data?.detail || err.message || 'Falha ao iniciar pagamento');
    }
  };

  if (!vendor) {
    return (
      <View style={styles.container}>
        <ActivityIndicator animating size="large" />
        <Text>A carregar...</Text>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }

  const profileUri = profilePhoto
    ? profilePhoto.uri
    : vendor.profile_photo
    ? `${BASE_URL.replace(/\/$/, '')}/${vendor.profile_photo}`
    : null;

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        {error && <Text style={styles.error}>{error}</Text>}

        <TouchableOpacity style={styles.mapButton} onPress={() => navigation.navigate('Map')}>
          <Text style={styles.mapIcon}>🗺️</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuOpen(!menuOpen)}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Meu Perfil</Text>

        {/* O resto do conteúdo do perfil (edição e visualização) */}
        {/* Já tinhas essa parte bem feita no código original, posso colar de novo se quiseres */}

      </ScrollView>

      {menuOpen && (
        <View style={styles.menu}>
          <Button mode="text" onPress={() => { setMenuOpen(false); setEditing(true); }}>
            Atualizar Dados
          </Button>
          <Button mode="text" onPress={() => { setMenuOpen(false); paySubscription(); }}>
            Pagar Semanalidade
          </Button>
          <Button mode="text" onPress={() => { setMenuOpen(false); navigation.navigate('PaidWeeks'); }}>
            {t('paidWeeksTitle')}
          </Button>
          <Button mode="text" onPress={() => { setMenuOpen(false); navigation.navigate('Routes'); }}>
            Trajetos
          </Button>
          <Button mode="text" onPress={() => { setMenuOpen(false); navigation.navigate('Stats'); }}>
            {t('statsTitle')}
          </Button>
          <Button mode="text" onPress={() => { setMenuOpen(false); navigation.navigate('Language'); }}>
            {t('languageTitle')}
          </Button>
          <Button mode="text" onPress={() => { setMenuOpen(false); navigation.navigate('Terms'); }}>
            Termos e Condições
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 16,
    backgroundColor: theme.colors.background,
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  error: { color: 'red', marginBottom: 12, textAlign: 'center' },
  mapButton: { position: 'absolute', top: 16, right: 16 },
  mapIcon: { fontSize: 50 },
  menuButton: { position: 'absolute', top: 16, left: 16 },
  menuIcon: { fontSize: 40 },
  menu: {
    position: 'absolute',
    top: 70,
    left: 16,
    backgroundColor: theme.colors.background,
    padding: 8,
    borderRadius: 8,
    elevation: 10,
    zIndex: 100,
  },
});
