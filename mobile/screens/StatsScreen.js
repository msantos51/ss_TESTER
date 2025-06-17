import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { BarChart, Grid, XAxis, YAxis } from 'react-native-svg-charts';
import * as scale from 'd3-scale';
import { BASE_URL } from '../config';
import { theme } from '../theme';
import t from '../i18n';

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
    <View style={styles.container} accessible accessibilityLabel={t('statsTitle')}>
      {data.length > 0 ? (
        <View style={{ flexDirection: 'row', height: 200 }}>
          <YAxis
            data={data}
            contentInset={{ top: 10, bottom: 10 }}
            svg={{ fontSize: 10 }}
            style={{ marginRight: 8 }}
          />
          <View style={{ flex: 1 }}>
            <BarChart
              style={{ flex: 1 }}
              data={data}
              contentInset={{ top: 10, bottom: 10 }}
              svg={{ fill: theme.colors.primary }}
            >
              <Grid />
            </BarChart>
            <XAxis
              style={{ marginTop: 8 }}
              data={data}
              formatLabel={(value, index) => labels[index]}
              scale={scale.scaleBand}
            />
          </View>
        </View>
      ) : (
        <Text>{t('noRoutes')}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: theme.colors.background },
});
