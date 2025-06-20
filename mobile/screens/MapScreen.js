// (em português) Este ecrã mostra o mapa com os vendedores ativos e o pin azul do cliente

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import {
  Button,
  Text,
  TextInput,
  ActivityIndicator,
} from 'react-native-paper';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LeafletMap from '../LeafletMap';
import axios from 'axios';
import { BASE_URL } from '../config';
import { theme } from '../theme';
import { subscribe as subscribeLocations } from '../socketService';
import {
  startLocationSharing,
  stopLocationSharing,
  isLocationSharing,
} from '../locationService';
import * as Location from 'expo-location';
import useProximityNotifications from '../useProximityNotifications';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
} from '../favoritesService';
import t from '../i18n';

export default function MapScreen({ navigation }) {
  const [vendors, setVendors] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState('Todos os vendedores');
  const [showList, setShowList] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [initialPosition, setInitialPosition] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [userPosition, setUserPosition] = useState(null);
  const mapRef = useRef(null);

  const fetchVendors = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/vendors/`);
      setVendors(res.data);
    } catch (err) {
      console.log('Erro ao buscar vendedores:', err);
    }
  };

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) {
        const v = JSON.parse(stored);
        setCurrentUser(v);
        const share = await isLocationSharing();
        if (share) {
          try {
            await startLocationSharing(v.id);
          } catch (err) {
            console.log('Erro ao iniciar localização:', err);
          }
        }
      } else {
        setCurrentUser(null);
        await stopLocationSharing();
      }
    } catch (err) {
      console.log('Erro ao carregar utilizador:', err);
      setCurrentUser(null);
    }
  };

  const loadFavorites = async () => {
    const favs = await getFavorites();
    setFavoriteIds(favs);
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchVendors();
      loadUser();
      loadFavorites();
    });
    fetchVendors();
    loadUser();
    loadFavorites();
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = subscribeLocations(({ vendor_id, lat, lng, remove }) => {
      setVendors((prev) => {
        if (remove === true) {
          return prev.filter((v) => v.id !== vendor_id);
        }
        const exists = prev.find((v) => v.id === vendor_id);
        if (exists) {
          return prev.map((v) =>
            v.id === vendor_id ? { ...v, current_lat: lat, current_lng: lng } : v
          );
        } else {
          return [...prev, { id: vendor_id, current_lat: lat, current_lng: lng }];
        }
      });
    });
    return unsubscribe;
  }, []);

  const locateUser = async (zoom = 18) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        const coords = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
        setInitialPosition(coords);
        setUserPosition(coords);
        mapRef.current?.setView(loc.coords.latitude, loc.coords.longitude, zoom);
      }
    } catch (err) {
      console.log('Erro ao obter localização:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      await locateUser(15);
      setLoadingLocation(false);
    };
    init();
  }, []);

  const activeVendors = vendors.filter((v) => v?.current_lat != null && v?.current_lng != null);
  const filteredVendors = activeVendors.filter(
    (v) =>
      (selectedProduct === 'Todos os vendedores' || v?.product === selectedProduct) &&
      (searchQuery === '' || v?.name?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  useProximityNotifications(filteredVendors, 500, favoriteIds);

  return (
    <View style={styles.container}>
      {loadingLocation ? (
        <ActivityIndicator animating size="large" style={StyleSheet.absoluteFill} />
      ) : (
        <LeafletMap
          ref={mapRef}
          initialPosition={initialPosition}
          markers={[
            ...filteredVendors.map((v) => {
              const photo = v.profile_photo
                ? `${BASE_URL.replace(/\/$/, '')}/${v.profile_photo}`
                : null;
              return {
                latitude: v.current_lat,
                longitude: v.current_lng,
                title: v.name || 'Vendedor',
                iconHtml: photo
                  ? `<div class="gm-pin" style="border: 2px solid ${v.pin_color || '#FFB6C1'};"><img src="${photo}" /></div>`
                  : null,
                selected: v.id === selectedVendorId,
              };
            }),
            ...(userPosition
              ? [
                  {
                    latitude: userPosition.latitude,
                    longitude: userPosition.longitude,
                    title: 'Você',
                    iconHtml:
                      '<div class="gm-pin" style="background-color: #0077FF; border-radius: 50%; width: 24px; height: 24px; border: 2px solid white;"></div>',
                  },
                ]
              : []),
          ]}
        />
      )}

      {!loadingLocation && (
        <TouchableOpacity style={styles.locateButton} onPress={() => locateUser()}>
          <Text style={styles.locateIcon}>📍</Text>
        </TouchableOpacity>
      )}

      <View style={styles.filterContainer}>
        <Picker
          selectedValue={selectedProduct}
          onValueChange={(itemValue) => setSelectedProduct(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Todos os vendedores" value="Todos os vendedores" />
          <Picker.Item label="Bolas de Berlim" value="Bolas de Berlim" />
          <Picker.Item label="Acessórios" value="Acessórios" />
          <Picker.Item label="Gelados" value="Gelados" />
        </Picker>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  filterContainer: {
    position: 'absolute',
    top: 10,
    left: 20,
    right: 20,
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 6,
  },
  picker: { backgroundColor: '#eee', marginBottom: 4 },
  locateButton: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    backgroundColor: theme.colors.background,
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  locateIcon: {
    fontSize: 24,
  },
});
