// (em português) Dashboard do cliente com menu estilo hambúrguer e estrutura unificada
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Animated,
  Linking,
} from 'react-native';
import { Text, Button, List } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../config';
import { getFavorites } from '../favoritesService';
import { theme } from '../theme';

export default function ClientDashboardScreen({ navigation }) {
  const [client, setClient] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  // menuAnim
  const menuAnim = useRef(new Animated.Value(0)).current;
  const [accountOpen, setAccountOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // loadClient
  const loadClient = async () => {
    try {
      // stored
      const stored = await AsyncStorage.getItem('client');
      if (stored) {
        setClient(JSON.parse(stored));
      } else {
        setClient(null);
      }
    } catch {
      setClient(null);
    }
  };

  // loadFavorites
  const loadFavorites = async () => {
    try {
      // ids
      const ids = await getFavorites();
      if (ids.length === 0) {
        setFavorites([]);
        return;
      }
      // resp
      const resp = await axios.get(`${BASE_URL}/vendors/`);
      // vendors
      const vendors = resp.data.filter((v) => ids.includes(v.id));
      setFavorites(vendors);
    } catch {
      setFavorites([]);
    }
  };

  // logout
  const logout = async () => {
    await AsyncStorage.removeItem('client');
    await AsyncStorage.removeItem('clientToken');
    navigation.replace('ClientLogin');
  };

  useEffect(() => {
    if (menuOpen) {
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
    loadClient();
    loadFavorites();
    // unsubscribe
    const unsubscribe = navigation.addListener('focus', () => {
      loadClient();
      loadFavorites();
    });
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={{ flex: 1 }}>
      <TouchableOpacity style={styles.mapButton} onPress={() => navigation.navigate('Map')}>
        <Text style={styles.mapIcon}>🗺️</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuButton} onPress={() => setMenuOpen(!menuOpen)}>
        <Text style={styles.menuIcon}>☰</Text>
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Meu Perfil</Text>

        {client?.profile_photo && (
          <Image
            source={{ uri: `${BASE_URL.replace(/\/$/, '')}/${client.profile_photo}` }}
            style={styles.imagePreview}
          />
        )}

        {client && (
          <>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Nome:</Text> {client.name}
            </Text>
            <Text style={styles.infoText}>
              <Text style={styles.label}>Email:</Text> {client.email}
            </Text>
          </>
        )}

        <Text style={styles.sectionTitle}>Vendedores Favoritos</Text>
        <View style={styles.favoriteList}>
          {favorites.map((item) => {
            // photoUri
            const photoUri = item.profile_photo
              ? `${BASE_URL.replace(/\/$/, '')}/${item.profile_photo}`
              : null;
            return (
              <TouchableOpacity
                key={item.id.toString()}
                style={styles.vendor}
                onPress={() => navigation.navigate('VendorDetail', { vendor: item })}
              >
                {photoUri && (
                  <Image
                    source={{ uri: photoUri }}
                    style={[
                      styles.image,
                      item.subscription_active ? styles.activePhoto : styles.inactivePhoto,
                    ]}
                  />
                )}
                <Text>{item.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Button mode="contained" style={styles.fullButton} onPress={logout}>
          <Text>Sair</Text>
        </Button>
      </ScrollView>

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
            <List.Item
              title="Notificações"
              onPress={() => {
                setMenuOpen(false);
                navigation.navigate('AccountSettings');
              }}
            />
            <List.Accordion
              title="Definições de Conta"
              expanded={accountOpen}
              onPress={() => setAccountOpen(!accountOpen)}
            >
              <List.Item
                title="Atualizar Dados Pessoais"
                onPress={() => {
                  setMenuOpen(false);
                  navigation.navigate('ManageAccount');
                }}
              />
              <List.Item
                title="Apagar Conta"
                onPress={() => {
                  setMenuOpen(false);
                  navigation.navigate('ManageAccount');
                }}
              />
            </List.Accordion>
            <List.Accordion
              title="Sobre e Ajuda"
              expanded={helpOpen}
              onPress={() => setHelpOpen(!helpOpen)}
            >
              <List.Item
                title="Termos e Condições"
                onPress={() => {
                  setMenuOpen(false);
                  navigation.navigate('Terms');
                }}
              />
              <List.Item
                title="Contactar Suporte"
                onPress={() => {
                  setMenuOpen(false);
                  Linking.openURL('mailto:suporte@sunnysales.com');
                }}
              />
            </List.Accordion>
          </List.Section>
        </Animated.View>
</View>
  );
}

// styles
const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, alignItems: 'center', backgroundColor: theme.colors.background },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  infoText: { marginBottom: 8, width: '100%' },
  label: { fontWeight: 'bold' },
  imagePreview: { width: 120, height: 120, borderRadius: 60, marginBottom: 16 },
  fullButton: { width: '100%', marginVertical: 8 },
  mapButton: { position: 'absolute', top: 16, right: 16, zIndex: 101, elevation: 10 },
  mapIcon: { fontSize: 40 },
  menuButton: { position: 'absolute', top: 16, left: 16, zIndex: 101, elevation: 10 },
  menuIcon: { fontSize: 40 },
  menu: { position: 'absolute', top: 70, left: 16, right: 16, backgroundColor: 'white', padding: 8, borderRadius: 12, elevation: 10, zIndex: 100 },
  sectionTitle: { alignSelf: 'flex-start', fontWeight: 'bold', marginTop: 8, marginBottom: 4 },
  favoriteList: { width: '100%', marginBottom: 12 },
  vendor: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#ccc' },
  image: { width: 40, height: 40, borderRadius: 20, marginRight: 8 },
  activePhoto: { borderWidth: 2, borderColor: 'green' },
  inactivePhoto: { borderWidth: 2, borderColor: 'red' },
  logoutButton: {
  width: '100%',
  marginVertical: 8,
  borderRadius: 12,
  backgroundColor: '#FDC500',
},

});
