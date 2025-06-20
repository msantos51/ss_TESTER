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
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
  const colorOptions = [
    '#FFB6C1', // Rosa Pastel
    '#ADD8E6', // Azul Pastel
    '#90EE90', // Verde Pastel
    '#FFFF99', // Amarelo Pastel
    '#C8A2C8', // Lilás Pastel
    '#98E8D5', // Menta Pastel
    '#FFCC99', // Pêssego Pastel
    '#E6E6FA', // Lavanda Pastel
  ];
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [error, setError] = useState(null);
  const [sharingLocation, setSharingLocation] = useState(false);
  const [editing, setEditing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reviews, setReviews] = useState([]);

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
        fetchReviews(vendorId);
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
    navigation.replace('Login');
  };

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
  try {
    await startLocationSharing(v.id);
    setSharingLocation(true);
  } catch (err) {
    setError(err.message);
    setSharingLocation(false);
  }
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
      setError('Preencha as passwords');
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
        const fileUri = profilePhoto.uri;
        const file = {
          uri: fileUri,
          name: 'profile.jpg',
          type: 'image/jpeg',
        };
        data.append('profile_photo', file);
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
      setError(null);
      setProfilePhoto(null);
      setEditing(false);
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
      const res = await axios.post(
        `${BASE_URL}/vendors/${vendor.id}/create-checkout-session`,
        null,
        {
          headers: { Authorization: token ? `Bearer ${token}` : undefined },
        }
      );
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
          <MaterialCommunityIcons name="map-outline" size={50} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuOpen(!menuOpen)}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Meu Perfil</Text>

        {editing ? (
          <>
            {profileUri && (
              <TouchableOpacity onPress={pickImage}>
                <Image source={{ uri: profileUri }} style={styles.imagePreview} />
              </TouchableOpacity>
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

            {changingPassword ? (
              <>
                <TextInput
                  mode="outlined"
                  style={styles.input}
                  label="Password atual"
                  secureTextEntry
                  value={oldPassword}
                  onChangeText={setOldPassword}
                />
                <TextInput
                  mode="outlined"
                  style={styles.input}
                  label="Nova password"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </>
            ) : (
              <>
                <TextInput
                  mode="outlined"
                  style={[styles.input, styles.inputDisabled]}
                  label="Password"
                  value="********"
                  editable={false}
                />
                <Button mode="outlined" onPress={() => setChangingPassword(true)}>
                  Alterar password
                </Button>
              </>
            )}

            <Picker selectedValue={product} onValueChange={(itemValue) => setProduct(itemValue)} style={styles.input}>
              <Picker.Item label="Bolas de Berlim" value="Bolas de Berlim" />
              <Picker.Item label="Gelados" value="Gelados" />
              <Picker.Item label="Acessórios" value="Acessórios" />
            </Picker>

            <Text style={styles.pinColorLabel}>Cor do contorno do pin</Text>
            <View style={styles.colorOptions}>
              {colorOptions.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setPinColor(c)}
                  style={[
                    styles.colorOption,
                    { backgroundColor: c },
                    pinColor === c && styles.colorOptionSelected,
                  ]}
                />
              ))}
            </View>

            <View style={styles.row}>
              <View style={styles.halfButton}>
                <Button mode="contained" onPress={updateProfile}>Guardar</Button>
              </View>
              <View style={[styles.halfButton, styles.leftSpacing]}>
                <Button
                  mode="outlined"
                  onPress={() => {
                    setName(vendor.name);
                    setEmail(vendor.email);
                    setProduct(vendor.product);
                    setPinColor(vendor.pin_color || '#FFB6C1');
                    setProfilePhoto(null);
                    setPassword('');
                    setOldPassword('');
                    setChangingPassword(false);
                    setEditing(false);
                  }}
                >
                  Cancelar
                </Button>
              </View>
            </View>
          </>
        ) : (
          <>
            {profileUri && <Image source={{ uri: profileUri }} style={styles.imagePreview} />}
            <Text style={styles.infoText}>
              <Text style={styles.label}>Nome:</Text> {vendor.name}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Email:</Text> {vendor.email}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Produto:</Text> {vendor.product}
            </Text>
            <View style={[styles.infoText, styles.colorRow]}>
              <Text style={styles.label}>Cor do Pin:</Text>
              <View
                style={[
                  styles.colorPreview,
                  { backgroundColor: vendor.pin_color || '#FFB6C1' },
                ]}
              />
            </View>
          </>
        )}

        <View style={styles.fullButton}>
          <Button
            mode="contained"
            onPress={toggleLocation}
          >
            {sharingLocation ? 'Desativar Localização' : 'Ativar Localização'}
          </Button>
        </View>

        <Text style={{ color: sharingLocation ? 'green' : 'gray', marginVertical: 8, textAlign: 'center' }}>
          {sharingLocation ? 'Partilha de localização ativa' : 'Localização não partilhada'}
        </Text>

        {(() => {
          if (vendor.subscription_active) {
            if (vendor.subscription_valid_until) {
              const diffMs = new Date(vendor.subscription_valid_until).getTime() - Date.now();
              const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
              return (
                <Text style={{ marginVertical: 8, textAlign: 'center' }}>
                  {`Subscrição ativa – termina em ${daysLeft} dia${daysLeft !== 1 ? 's' : ''}`}
                </Text>
              );
            }
            return <Text style={{ marginVertical: 8, textAlign: 'center' }}>Subscrição ativa</Text>;
          }
          return <Text style={{ marginVertical: 8, textAlign: 'center' }}>Subscrição inativa</Text>;
        })()}

        <View style={styles.reviewSection}>
          <Text style={styles.sectionTitle}>Minhas Avaliações</Text>
          {reviews.length > 0 ? (
            <>
              <Text style={styles.averageText}>
                {vendor.rating_average != null
                  ? `Média: ${vendor.rating_average.toFixed(1)}\u2605`
                  : 'Ainda sem avaliações'}
              </Text>
              {reviews.map((r) => (
                <View key={r.id} style={styles.reviewItem}>
                  <Text style={styles.reviewRating}>⭐ {r.rating}</Text>
                  {r.comment ? <Text>{r.comment}</Text> : null}
                </View>
              ))}
            </>
          ) : (
            <Text style={styles.averageText}>Ainda sem avaliações</Text>
          )}
        </View>

        <View style={[styles.fullButton, styles.logoutButton]}>
          <Button mode="outlined" onPress={logout}>Logout</Button>
        </View>
      </ScrollView>

      {menuOpen && (
        <View style={styles.menu}>
          <Button mode="text" onPress={() => { setMenuOpen(false); setEditing(true); }}>
            Atualizar Dados
          </Button>
          <Button mode="text" onPress={() => { setMenuOpen(false); paySubscription(); }}>
            Pagar Semanalidade
          </Button>
          <Button mode="text" onPress={() => { setMenuOpen(false); navigation.navigate('Routes'); }}>
            Trajetos
          </Button>
          <Button mode="text" onPress={() => { setMenuOpen(false); navigation.navigate('Stats'); }}>
            {t('statsTitle')}
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
  input: { marginBottom: 12, width: '100%' },
  inputDisabled: { backgroundColor: '#eee', color: '#666' },
  infoText: { marginBottom: 8, width: '100%' },
  label: { fontWeight: 'bold' },
  error: { color: 'red', marginBottom: 12, textAlign: 'center' },
  imagePreview: { width: 120, height: 120, marginVertical: 12, borderRadius: 60 },
  row: { flexDirection: 'row', width: '100%', justifyContent: 'space-between', marginBottom: 12 },
  halfButton: { flex: 1 },
  leftSpacing: { marginLeft: 12 },
  fullButton: { width: '100%', marginBottom: 12 },
  logoutButton: { marginTop: 'auto' },
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
  reviewSection: { width: '100%', marginTop: 16 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 4 },
  averageText: { marginBottom: 8 },
  reviewItem: {
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  reviewRating: { fontWeight: 'bold' },
  pinColorLabel: { alignSelf: 'flex-start', marginBottom: 4 },
  colorOptions: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 12 },
  colorOption: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#000',
  },
  colorOptionSelected: { borderWidth: 3 },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorPreview: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#000',
  },
});
