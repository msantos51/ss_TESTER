import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Location from 'expo-location';
import { AuthContext } from '../context/AuthContext';
import api, { BASE_URL } from '../services/api';

let watchId: Location.LocationSubscription | null = null;

export default function DashboardScreen({ navigation }: any) {
  const { vendor, logout, token } = useContext(AuthContext);
  const [sharing, setSharing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSharingStatus = async () => {
      if (!vendor || !token) return;
      try {
        const res = await api.get(`/vendors/${vendor.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSharing(res.data?.is_currently_sharing || false);
      } catch (error) {
        console.error('Erro ao verificar status:', error);
      }
    };
    checkSharingStatus();
  }, [vendor]);

  const startSharing = useCallback(async () => {
    if (!vendor || !token) return;

    if (!vendor.subscription_active) {
      Alert.alert(
        'Subscrição Inativa',
        'Ative a sua subscrição para partilhar localização',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Ativar',
            onPress: () => {
              paySubscription();
            },
          },
        ]
      );
      return;
    }

    setLoading(true);
    try {
      await axios.post(
        `${BASE_URL}/vendors/${vendor.id}/routes/start`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Erro', 'Permissão de localização negada');
        setLoading(false);
        return;
      }

      watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        async (position) => {
          try {
            await axios.put(
              `${BASE_URL}/vendors/${vendor.id}/location`,
              {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (error) {
            console.error('Erro ao enviar localização:', error);
          }
        }
      );

      setSharing(true);
      Alert.alert('Sucesso', 'Localização em partilha. Está visível no mapa.');
    } catch (error: any) {
      console.error('Erro ao iniciar partilha:', error);
      Alert.alert('Erro', 'Não foi possível iniciar a partilha de localização');
      setSharing(false);
    } finally {
      setLoading(false);
    }
  }, [vendor, token]);

  const stopSharing = useCallback(async () => {
    if (!vendor || !token) return;
    setLoading(true);
    try {
      if (watchId) {
        watchId.remove();
        watchId = null;
      }

      await axios.post(
        `${BASE_URL}/vendors/${vendor.id}/routes/stop`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSharing(false);
      Alert.alert('Sucesso', 'Partilha de localização parada.');
    } catch (error) {
      console.error('Erro ao parar partilha:', error);
      Alert.alert('Erro', 'Erro ao parar a partilha');
    } finally {
      setLoading(false);
    }
  }, [vendor, token]);

  const handleToggleSharing = () => {
    if (sharing) {
      stopSharing();
    } else {
      startSharing();
    }
  };

  const paySubscription = async () => {
    if (!vendor || !token) return;
    try {
      const res = await axios.post(
        `${BASE_URL}/vendors/${vendor.id}/create-checkout-session`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.checkout_url) {
        // For mobile, we could use WebView or Linking
        Alert.alert('Pagamento', 'Abra o link no navegador para pagar a subscrição');
      }
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
    }
  };

  const menuItem = (label: string, icon: string, onPress: () => void, color: string = '#1976d2') => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={[styles.menuIcon, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon as any} size={20} color={color} />
      </View>
      <Text style={styles.menuLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  const subscriptionActive = vendor?.subscription_active;
  const subscriptionDate = vendor?.subscription_valid_until
    ? new Date(vendor.subscription_valid_until).toLocaleDateString('pt-PT')
    : null;

  const photoUrl = vendor?.profile_photo
    ? vendor.profile_photo.startsWith('http')
      ? vendor.profile_photo
      : `${BASE_URL}${vendor.profile_photo}`
    : null;

  return (
    <ScrollView style={styles.container}>
      {/* Greeting */}
      {vendor && (
        <View style={styles.greetingSection}>
          <Text style={styles.greeting}>
            Olá, {vendor.name?.split(' ')[0]}!
          </Text>
          <Text style={styles.time}>
            {new Date().toLocaleDateString('pt-PT', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </Text>
        </View>
      )}

      {/* Profile Card */}
      {vendor && (
        <View style={styles.profileCard}>
          <View style={styles.profileTop}>
            {photoUrl ? (
              <Image source={{ uri: photoUrl }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>
                  {vendor.name?.charAt(0)?.toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.profileMeta}>
              <Text style={styles.profileName}>{vendor.name}</Text>
              <Text style={styles.profileProduct}>{vendor.product}</Text>
              <View
                style={[
                  styles.subBadge,
                  { backgroundColor: subscriptionActive ? '#e8f5e9' : '#ffebee' },
                ]}
              >
                <View
                  style={[
                    styles.subDot,
                    { backgroundColor: subscriptionActive ? '#4caf50' : '#e74c3c' },
                  ]}
                />
                <Text
                  style={[
                    styles.subText,
                    { color: subscriptionActive ? '#4caf50' : '#e74c3c' },
                  ]}
                >
                  {subscriptionActive
                    ? `Ativa · ${subscriptionDate}`
                    : 'Inativa'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Location Sharing Card */}
      <View style={[styles.sharingCard, sharing && styles.sharingCardActive]}>
        <View style={styles.sharingHeader}>
          <View style={styles.sharingIconWrap}>
            <Ionicons
              name="location"
              size={24}
              color={sharing ? '#4caf50' : '#999'}
            />
            {sharing && <View style={styles.sharingPulse} />}
          </View>
          <View style={styles.sharingText}>
            <Text style={styles.sharingTitle}>Partilha de Localização</Text>
            <Text style={[styles.sharingStatus, { color: sharing ? '#4caf50' : '#999' }]}>
              {sharing ? 'Ativo — visível no mapa' : 'Desligado'}
            </Text>
          </View>
          {!loading && (
            <Switch
              value={sharing}
              onValueChange={handleToggleSharing}
              trackColor={{ false: '#ccc', true: '#81c784' }}
              thumbColor={sharing ? '#4caf50' : '#f0f0f0'}
            />
          )}
          {loading && <ActivityIndicator color="#1976d2" />}
        </View>
      </View>

      {/* CTA if subscription inactive */}
      {vendor && !subscriptionActive && (
        <TouchableOpacity
          style={styles.ctaCard}
          onPress={paySubscription}
        >
          <View style={styles.ctaIcon}>
            <Ionicons name="card" size={24} color="#fff" />
          </View>
          <View style={styles.ctaText}>
            <Text style={styles.ctaTitle}>Subscrição Inativa</Text>
            <Text style={styles.ctaDesc}>
              Ative para partilhar localização
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Menu Section */}
      <View style={styles.menuSection}>
        <Text style={styles.menuSectionTitle}>Subscrição</Text>
        {menuItem('Semanas Pagas', 'calendar', () => navigation.navigate('PaidWeeks'), '#1976d2')}
        {menuItem('Faturas', 'document-text', () => navigation.navigate('Invoices'), '#2196f3')}

        <Text style={[styles.menuSectionTitle, { marginTop: 16 }]}>Perfil</Text>
        {menuItem('Dados Pessoais', 'person', () => navigation.navigate('Account'), '#9c27b0')}
        {menuItem('Sessões', 'time', () => navigation.navigate('Sessions'), '#ff9800')}

        <Text style={[styles.menuSectionTitle, { marginTop: 16 }]}>Legal</Text>
        {menuItem('Termos e Condições', 'shield-checkmark', () => navigation.navigate('Terms'), '#4caf50')}

        {/* Logout */}
        <TouchableOpacity style={[styles.menuItem, styles.logoutItem]} onPress={logout}>
          <View style={styles.menuIcon}>
            <Ionicons name="log-out" size={20} color="#e74c3c" />
          </View>
          <Text style={[styles.menuLabel, { color: '#e74c3c' }]}>Sair</Text>
          <Ionicons name="chevron-forward" size={20} color="#ccc" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  greetingSection: {
    padding: 16,
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  profileCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  profileMeta: {
    flex: 1,
  },
  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  profileProduct: {
    fontSize: 12,
    color: '#999',
    marginBottom: 6,
  },
  subBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  subDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  subText: {
    fontSize: 11,
    fontWeight: '500',
  },
  sharingCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ccc',
  },
  sharingCardActive: {
    borderLeftColor: '#4caf50',
    backgroundColor: '#f1f8f4',
  },
  sharingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sharingIconWrap: {
    position: 'relative',
    marginRight: 12,
  },
  sharingPulse: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    top: -4,
    right: -4,
  },
  sharingText: {
    flex: 1,
  },
  sharingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  sharingStatus: {
    fontSize: 12,
  },
  ctaCard: {
    backgroundColor: '#1976d2',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ctaText: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  ctaDesc: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  menuSection: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  menuSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#999',
    textTransform: 'uppercase',
    marginBottom: 8,
    marginTop: 16,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  logoutItem: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
});
