// Tela que lista os trajetos do vendedor
import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Text, List } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../config';
import { theme } from '../theme';
import BackButton from '../BackButton';

export default function RoutesScreen({ navigation }) {
  const [routes, setRoutes] = useState([]);

  const loadRoutes = async () => {
    const stored = await AsyncStorage.getItem('user');
    const token = await AsyncStorage.getItem('token');
    if (!stored) return;
    const vendor = JSON.parse(stored);
    try {
      const res = await axios.get(`${BASE_URL}/vendors/${vendor.id}/routes`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setRoutes(res.data);
    } catch (e) {
      console.log('Erro ao carregar trajetos:', e);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadRoutes);
    loadRoutes();
    return unsubscribe;
  }, [navigation]);

  const renderItem = ({ item }) => {
    const start = new Date(item.start_time);
    const end = item.end_time ? new Date(item.end_time) : null;
    const durationMin = end ? Math.round((end - start) / 60000) : 0;
    const title = start.toLocaleString();
    const description = `${durationMin} min - ${(item.distance_m / 1000).toFixed(2)} km`;
    return (
      <List.Item
        style={styles.item}
        title={title}
        description={description}
        onPress={() => navigation.navigate('RouteDetail', { route: item })}
      />
    );
  };

  return (
    <View style={styles.container}>
      <BackButton style={styles.back} />
      <FlatList data={routes} keyExtractor={(r) => r.id.toString()} renderItem={renderItem} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  item: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  back: { position: 'absolute', top: 16, left: 16 },
});
