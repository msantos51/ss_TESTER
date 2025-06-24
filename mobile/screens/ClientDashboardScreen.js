// Dashboard simples para o cliente listar os vendedores favoritos
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Image, FlatList, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../config';
import { getFavorites, clearFavorites as clearAllFavorites } from '../favoritesService';
import { theme } from '../theme';
import t from '../i18n';

export default function ClientDashboardScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  // Função para carregar os favoritos
  const loadFavorites = async () => {
    const ids = await getFavorites();
    if (ids.length === 0) {
      setFavorites([]);
      return;
    }
    try {
      const resp = await axios.get(`${BASE_URL}/vendors/`);
      const vendors = resp.data.filter((v) => ids.includes(v.id));
      setFavorites(vendors);
    } catch (e) {
      console.log('Erro ao carregar favoritos:', e);
    }
  };

  // Função para logout
  const logout = async () => {
    await AsyncStorage.removeItem('client');
    await AsyncStorage.removeItem('clientToken');
    navigation.replace('ClientLogin');
  };

  useEffect(() => {
    loadFavorites();
    const unsubscribe = navigation.addListener('focus', loadFavorites);
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuOpen(!menuOpen)}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Favoritos</Text>

        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => {
            const photoUri = item.profile_photo
              ? `${BASE_URL.replace(/\/$/, '')}/${item.profile_photo}`
              : null;
            return (
              <TouchableOpacity
                style={styles.vendor}
                onPress={() => navigation.navigate('VendorDetail', { vendor: item })}
              >
                {photoUri && (
                  <Image
                    source={{ uri: photoUri }}
                    style={[
                      styles.image,
                      item.subscription_active
                        ? styles.activePhoto
                        : styles.inactivePhoto,
                    ]}
                  />
                )}
                <Text>{item.name}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {menuOpen && (
        <View style={styles.menu}>
          <Button mode="text" onPress={() => { setMenuOpen(false); clearAllFavorites(); setFavorites([]); }}>
            {t('clearFavorites')}
          </Button>
          <Button mode="text" onPress={() => { setMenuOpen(false); navigation.navigate('AccountSettings'); }}>
            {t('accountSettingsTitle')}
          </Button>
          <Button mode="text" onPress={() => { setMenuOpen(false); navigation.navigate('ManageAccount'); }}>
            {t('manageAccount')}
          </Button>
          <Button mode="text" onPress={() => { setMenuOpen(false); navigation.navigate('About'); }}>
            {t('aboutHelp')}
          </Button>
          <Button mode="text" onPress={() => { setMenuOpen(false); logout(); }}>
            Sair
          </Button>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10, backgroundColor: theme.colors.background },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  menuButton: { position: 'absolute', top: 16, left: 16, padding: 10 },
  menuIcon: { fontSize: 30 },
  vendor: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  image: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
  activePhoto: { borderWidth: 2, borderColor: 'green' },
  inactivePhoto: { borderWidth: 2, borderColor: 'red' },
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
