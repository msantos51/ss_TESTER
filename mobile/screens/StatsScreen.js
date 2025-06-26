// Ecrã de estatísticas de distâncias percorridas
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BarChart } from 'react-native-chart-kit';
import { BASE_URL } from '../config';
import { theme } from '../theme';
import t from '../i18n';
import BackButton from '../BackButton';

export default function StatsScreen({ navigation }) {
  const [data, setData] = useState([]);
  const [labels, setLabels] = useState([]);

  const loadRoutes = async () => {
    const stored = await AsyncStorage.getItem('user');
    const token = await AsyncStorage.getItem('token');
    if (!stored) return;
    const vendor = JSON.parse(stored);
    try {
      const res = await axios.get(`${BASE_URL}/vendors/${vendor.id}/routes`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const daily = {};
      res.data.forEach((r) => {
        const d = r.start_time.split('T')[0];
        daily[d] = (daily[d] || 0) + r.distance_m;
      });
      const sorted = Object.entries(daily).sort();
      setData(sorted.map(([, dist]) => Number((dist / 1000).toFixed(2))));
      setLabels(sorted.map(([date]) => date.slice(5)));
    } catch (e) {
      console.log('Erro ao carregar stats:', e);
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener('focus', loadRoutes);
    loadRoutes();
    return unsub;
  }, [navigation]);

  return (
    <ScrollView contentContainerStyle={styles.container} accessible accessibilityLabel={t('statsTitle')}>
      <BackButton style={styles.back} />
      {data.length > 0 ? (
        <>
          <Text style={styles.title}>{t('statsTitle')}</Text>
          {/* Gráfico de barras com as distâncias por dia */}
          <BarChart
            data={{
              labels: labels,
              datasets: [{ data: data }]
            }}
            width={Dimensions.get('window').width - 32}
            height={300}
            yAxisSuffix="km"
            chartConfig={{
              backgroundColor: theme.colors.primary,
              backgroundGradientFrom: theme.colors.primary,
              backgroundGradientTo: theme.colors.accent,
              decimalPlaces: 1,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: '6', strokeWidth: '2', stroke: '#ffa726' },
            }}
            style={{ marginVertical: 8, borderRadius: 16 }}
          />
        </>
      ) : (
        <Text>{t('noRoutes')}</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 16, backgroundColor: theme.colors.background, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
  back: { position: 'absolute', top: 16, left: 16 },
});
