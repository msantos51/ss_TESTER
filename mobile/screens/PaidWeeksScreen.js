// Ecrã que lista semanas pagas e respetivos recibos
import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Linking } from 'react-native';
import { Text, List } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BASE_URL } from '../config';
import { theme } from '../theme';
import BackButton from '../BackButton';

export default function PaidWeeksScreen({ navigation }) {
  const [weeks, setWeeks] = useState([]);

  // loadWeeks
  const loadWeeks = async () => {
    // stored
    const stored = await AsyncStorage.getItem('user');
    // token
    const token = await AsyncStorage.getItem('token');
    if (!stored) return;
    // vendor
    const vendor = JSON.parse(stored);
    try {
      // res
      const res = await axios.get(
        `${BASE_URL}/vendors/${vendor.id}/paid-weeks`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      setWeeks(res.data);
    } catch (e) {
      console.log('Erro ao carregar semanas:', e);
    }
  };

  useEffect(() => {
    // unsub
    const unsub = navigation.addListener('focus', loadWeeks);
    loadWeeks();
    return unsub;
  }, [navigation]);

// renderItem
const renderItem = ({ item }) => {
  // start
  const start = new Date(item.start_date).toLocaleDateString();
  // end
  const end = new Date(item.end_date).toLocaleDateString();
  return (
    <List.Item
      style={styles.item}
      title={`${start} - ${end}`}
      description={item.receipt_url ? 'Recibo disponível' : ''}
      onPress={() => item.receipt_url && Linking.openURL(item.receipt_url)}
    />
  );
};

  return (
    <View style={styles.container}>
      <BackButton style={styles.back} />
      <FlatList data={weeks} keyExtractor={(w) => w.id.toString()} renderItem={renderItem} />
    </View>
  );
}

// styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
  item: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  back: { position: 'absolute', top: 16, left: 16 },
});
