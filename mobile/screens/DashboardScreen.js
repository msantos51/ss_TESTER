// (em português) Dashboard do vendedor com proteções no render, menu corrigido e sem conflito de ScrollView + FlatList
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  Linking,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  ActivityIndicator,
  List,
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../config';
import { theme } from '../theme';
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
  // menuAnim
  const menuAnim = useRef(new Animated.Value(0)).current;
  const [paymentsOpen, setPaymentsOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [uploadingStory, setUploadingStory] = useState(false);

  // colorOptions
  const colorOptions = ['#FFB6C1', '#ADD8E6', '#90EE90', '#FFFF99', '#C8A2C8', '#98E8D5', '#FFCC99', '#E6E6FA'];

  useEffect(() => {
    if (menuOpen) {
      setPaymentsOpen(false);
      setStatsOpen(false);
      setAccountOpen(false);
      setHelpOpen(false);
    }
  }, [menuOpen]);

  useEffect(() => {
    Animated.timing(menuAnim, {
      toValue: menuOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [menuOpen]);

  useEffect(() => {
    // loadVendor
    const loadVendor = async () => {
      try {
        // stored
        const stored = await AsyncStorage.getItem('user');
        if (stored) {
          // v
          const v = JSON.parse(stored);
          setVendor(v);
          setName(v.name);
          setEmail(v.email);
          setProduct(v.product);
          setPinColor(v.pin_color || '#FFB6C1');
          // share
          const share = await isLocationSharing();
          setSharingLocation(share);
        }
      } catch {
        setError('Erro ao carregar dados');
      }
    };
    loadVendor();
  }, []);

  useEffect(() => {
    // loadReviews
    const loadReviews = async () => {
      if (!vendor) return;
      try {
        // resp
        const resp = await axios.get(`${BASE_URL}/vendors/${vendor.id}/reviews`);
        setReviews(resp.data);
      } catch {
        console.log('Erro ao carregar reviews');
      }
    };
    loadReviews();
  }, [vendor]);

  // subscriptionText
  const subscriptionText = React.useMemo(() => {
    if (!vendor) return '';
    if (!vendor.subscription_active) return 'Subscrição inativa';
    if (!vendor.subscription_valid_until) return 'Subscrição ativa';
    // diff
    const diff = new Date(vendor.subscription_valid_until) - new Date();
    if (diff <= 0) return 'Subscrição expirada';
    // days
    const days = Math.floor(diff / 86400000);
    // hours
    const hours = Math.floor((diff % 86400000) / 3600000);
    return `Subscrição ativa - termina em ${days}d ${hours}h`;
  }, [vendor]);

  // profileUri
  const profileUri = profilePhoto
    ? profilePhoto.uri
    : vendor && vendor.profile_photo
    ? `${BASE_URL.replace(/\/$/, '')}/${vendor.profile_photo}`
    : null;

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

  // addStory
  const addStory = async (asset) => {
    if (!vendor || !asset) return;
    try {
      setUploadingStory(true);
      // token
      const token = await AsyncStorage.getItem('token');
      // data
      const data = new FormData();
      data.append('file', {
        uri: asset.uri,
        name: 'story.jpg',
        type: 'image/jpeg',
      });
      await axios.post(`${BASE_URL}/vendors/${vendor.id}/stories`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      Alert.alert('Story publicado');
    } catch (e) {
      setError('Erro ao publicar story');
    } finally {
      setUploadingStory(false);
    }
  };

  // handleAddStory
  const handleAddStory = () => {
    Alert.alert('Novo Story', 'Escolha uma opção', [
      {
        text: 'Câmara',
        onPress: async () => {
          // res
          const res = await ImagePicker.launchCameraAsync({ quality: 1 });
          if (!res.canceled && res.assets.length > 0) addStory(res.assets[0]);
        },
      },
      {
        text: 'Galeria',
        onPress: async () => {
          // res
          const res = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 1,
          });
          if (!res.canceled && res.assets.length > 0) addStory(res.assets[0]);
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  // updateProfile
  const updateProfile = async () => {
    if (!vendor) return;
    if (changingPassword && (!password || !oldPassword)) {
      setError('Preencha as palavras-passe');
      return;
    }
    try {
      // data
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
      // token
      const token = await AsyncStorage.getItem('token');
      // res
      const res = await axios.patch(`${BASE_URL}/vendors/${vendor.id}/profile`, data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      await AsyncStorage.setItem('user', JSON.stringify(res.data));
      setVendor(res.data);
      setEditing(false);
      setChangingPassword(false);
      setProfilePhoto(null);
      setPassword('');
      setOldPassword('');
      setError(null);
    } catch {
      setError('Erro ao atualizar perfil');
    }
  };

  // toggleLocation
  const toggleLocation = async () => {
    if (!vendor) return;
    if (sharingLocation) {
      await stopLocationSharing();
      setSharingLocation(false);
    } else {
      try {
        await startLocationSharing(vendor.id);
        setSharingLocation(true);
        setError(null);
      } catch (err) {
        // msg
        const msg =
          err?.response?.data?.detail === 'Subscription inactive'
            ? 'Dever\u00e1 pagar a semanalidade para poder ativar a localiza\u00e7\u00e3o'
            : 'Erro ao ativar localiza\u00e7\u00e3o';
        setError(msg);
      }
    }
  };

  // logout
  const logout = async () => {
    await stopLocationSharing();
    await AsyncStorage.removeItem('user');
    await AsyncStorage.removeItem('token');
    navigation.replace('VendorLogin');
  };

  // paySubscription
  const paySubscription = async () => {
    try {
      // token
      const token = await AsyncStorage.getItem('token');
      // res
      const res = await axios.post(`${BASE_URL}/vendors/${vendor.id}/create-checkout-session`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.checkout_url) Linking.openURL(res.data.checkout_url);
    } catch {
      setError('Erro no pagamento');
    }
  };

  if (!vendor) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text>A carregar...</Text>
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }

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

        {editing ? (
          <>
            {profileUri && (
              <TouchableOpacity onPress={pickImage}>
                <Image source={{ uri: profileUri }} style={styles.imagePreview} />
              </TouchableOpacity>
            )}
            <TextInput mode="outlined" style={styles.input} label="Nome" value={name} onChangeText={setName} />
            <TextInput mode="outlined" style={styles.input} label="Email" value={email} onChangeText={setEmail} />
            {changingPassword ? (
              <>
                <TextInput mode="outlined" style={styles.input} label="Palavra-passe atual" secureTextEntry value={oldPassword} onChangeText={setOldPassword} />
                <TextInput mode="outlined" style={styles.input} label="Nova palavra-passe" secureTextEntry value={password} onChangeText={setPassword} />
              </>
            ) : (
              <Button mode="outlined" onPress={() => setChangingPassword(true)}>
                <Text>Alterar palavra-passe</Text>
              </Button>
            )}
            <Picker selectedValue={product} onValueChange={setProduct} style={styles.input}>
              <Picker.Item label="Bolas de Berlim" value="Bolas de Berlim" />
              <Picker.Item label="Gelados" value="Gelados" />
              <Picker.Item label="Acessórios" value="Acessórios" />
            </Picker>
            <Text style={styles.pinColorLabel}>Cor do Pin</Text>
            <View style={styles.colorOptions}>
              {colorOptions.map((c) => (
                <TouchableOpacity key={c} onPress={() => setPinColor(c)} style={[
                  styles.colorOption,
                  { backgroundColor: c },
                  pinColor === c && styles.colorOptionSelected,
                ]} />
              ))}
            </View>
            <View style={styles.row}>
              <Button mode="contained" onPress={updateProfile}>
                <Text>Guardar</Text>
              </Button>
              <Button mode="outlined" onPress={() => setEditing(false)}>
                <Text>Cancelar</Text>
              </Button>
            </View>
          </>
        ) : (
          <>
            {profileUri && <Image source={{ uri: profileUri }} style={styles.imagePreview} />}
            <Text style={styles.infoText}><Text style={styles.label}>Nome:</Text> {vendor.name}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>Email:</Text> {vendor.email}</Text>
            <Text style={styles.infoText}><Text style={styles.label}>Produto:</Text> {vendor.product}</Text>
            <View style={styles.colorRow}>
              <Text style={styles.label}>Cor do Pin:</Text>
              <View style={[styles.colorPreview, { backgroundColor: vendor.pin_color || '#FFB6C1' }]} />
            </View>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Subscrição:</Text> {subscriptionText}
            </Text>
          </>
        )}

        <Button mode="contained" style={styles.fullButton} onPress={toggleLocation}>
          <Text>
            {sharingLocation ? 'Desativar Localização' : 'Ativar Localização'}
          </Text>
        </Button>

        <Text style={styles.sectionTitle}>Avaliações</Text>
        <View style={styles.reviewList}>
          {reviews.map((item) => (
            <View key={item.id.toString()} style={styles.reviewItem}>
              <Text style={styles.reviewRating}>⭐ {item.rating}</Text>
              {item.comment ? <Text>{item.comment}</Text> : null}
            </View>
          ))}
        </View>

        <Button mode="contained" style={styles.fullButton} onPress={logout}>
          <Text>Sair</Text>
        </Button>
      </ScrollView>

      <TouchableOpacity
        style={styles.storyButton}
        onPress={handleAddStory}
        disabled={uploadingStory}
      >
        <Text style={styles.storyIcon}>📷</Text>
      </TouchableOpacity>

      <Animated.View
        pointerEvents={menuOpen ? 'auto' : 'none'}
        style={[
          styles.menu,
          {
            opacity: menuAnim,
            transform: [
              {
                scale: menuAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              },
            ],
          },
        ]}
      >
        <List.Section>
            <List.Accordion title="Pagamentos" expanded={paymentsOpen} onPress={() => setPaymentsOpen(!paymentsOpen)}>
              <List.Item title="Pagar Semanalidade" onPress={() => { setMenuOpen(false); paySubscription(); }} />
              <List.Item title="Semanas Pagas" onPress={() => { setMenuOpen(false); navigation.navigate('PaidWeeks'); }} />
              <List.Item title="Faturas" onPress={() => { setMenuOpen(false); navigation.navigate('Invoices'); }} />
            </List.Accordion>
            <List.Accordion title="Estatísticas" expanded={statsOpen} onPress={() => setStatsOpen(!statsOpen)}>
              <List.Item title="Trajetos" onPress={() => { setMenuOpen(false); navigation.navigate('Routes'); }} />
              <List.Item title="Distância Percorrida" onPress={() => { setMenuOpen(false); navigation.navigate('Stats'); }} />
            </List.Accordion>
            <List.Accordion title="Definições de Conta" expanded={accountOpen} onPress={() => setAccountOpen(!accountOpen)}>
              <List.Item title="Atualizar Dados Pessoais" onPress={() => { setMenuOpen(false); setEditing(true); }} />
              <List.Item title="Apagar Conta" onPress={() => { setMenuOpen(false); navigation.navigate('ManageAccount'); }} />
            </List.Accordion>
            <List.Accordion title="Sobre e Ajuda" expanded={helpOpen} onPress={() => setHelpOpen(!helpOpen)}>
              <List.Item title="Termos e Condições" onPress={() => { setMenuOpen(false); navigation.navigate('Terms'); }} />
              <List.Item title="Contactar Suporte" onPress={() => { setMenuOpen(false); Linking.openURL('mailto:suporte@sunnysales.com'); }} />
            </List.Accordion>
          </List.Section>
        </Animated.View>
</View>
  );
}

// (em português) Estilos modernos inspirados no exemplo que enviaste
const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 16, 
    alignItems: 'center', 
    backgroundColor: '#F9F9F9' // fundo cinza muito claro 
  },
  title: { 
    fontSize: 22, 
    fontWeight: '600', 
    color: '#333', 
    marginBottom: 16 
  },
  input: { 
    marginBottom: 12, 
    width: '100%', 
    backgroundColor: '#fff', 
    borderRadius: 12 
  },
  infoText: { 
    marginBottom: 8, 
    width: '100%', 
    fontSize: 16, 
    color: '#555' 
  },
  label: { 
    fontWeight: 'bold', 
    color: '#333' 
  },
  error: { 
    color: 'red', 
    textAlign: 'center', 
    marginBottom: 12 
  },
  imagePreview: { 
    width: 120, 
    height: 120, 
    borderRadius: 60, 
    marginBottom: 16, 
    borderWidth: 2, 
    borderColor: '#FDC500' // cor do amarelo principal 
  },
  fullButton: { 
    width: '100%', 
    marginVertical: 8, 
    borderRadius: 12, 
    backgroundColor: '#FDC500' 
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    width: '100%' 
  },
  mapButton: { 
    position: 'absolute', 
    top: 16, 
    right: 16 
  },
  mapIcon: { 
    fontSize: 36 
  },
  menuButton: { 
    position: 'absolute', 
    top: 16, 
    left: 16 
  },
  menuIcon: { 
    fontSize: 36 
  },
  colorRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 8 
  },
  colorPreview: { 
    width: 20, 
    height: 20, 
    borderRadius: 10, 
    marginLeft: 8, 
    borderWidth: 1, 
    borderColor: '#000' 
  },
  colorOptions: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    marginBottom: 12 
  },
  colorOption: { 
    width: 24, 
    height: 24, 
    borderRadius: 12, 
    marginRight: 8, 
    marginBottom: 8, 
    borderWidth: 1, 
    borderColor: '#000' 
  },
  colorOptionSelected: { 
    borderWidth: 3 
  },
  pinColorLabel: { 
    alignSelf: 'flex-start', 
    marginBottom: 4 
  },
  menu: { 
    position: 'absolute', 
    top: 70, 
    left: 16, 
    right: 16, 
    backgroundColor: '#fff', 
    padding: 8, 
    borderRadius: 12, 
    elevation: 10, 
    zIndex: 100 
  },
  sectionTitle: { 
    alignSelf: 'flex-start', 
    fontWeight: '600', 
    fontSize: 18, 
    marginTop: 8, 
    marginBottom: 4 
  },
  reviewList: { 
    width: '100%', 
    marginBottom: 12 
  },
  reviewItem: { 
    paddingVertical: 4, 
    borderBottomWidth: 1, 
    borderBottomColor: '#ccc' 
  },
  reviewRating: {
    fontWeight: 'bold'
  },
  storyButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
  },
  storyIcon: {
    fontSize: 28,
  },
});
