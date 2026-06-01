import React, { useState, useEffect, useContext } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

interface Stats {
  total_distance: number;
  total_routes: number;
  avg_distance: number;
  longest_route: number;
}

export default function StatsScreen() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token, vendor } = useContext(AuthContext);

  const loadStats = async () => {
    if (!vendor) return;
    try {
      const res = await api.get(`/vendors/${vendor.id}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(res.data);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [vendor]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.content}>
        <StatCard
          icon="bar-chart"
          title="Distância Total"
          value={stats?.total_distance?.toFixed(2) || '0'}
          unit="km"
          color="#1976d2"
        />
        <StatCard
          icon="navigate"
          title="Total de Trajetos"
          value={stats?.total_routes?.toString() || '0'}
          unit=""
          color="#4caf50"
        />
        <StatCard
          icon="trending-up"
          title="Distância Média"
          value={stats?.avg_distance?.toFixed(2) || '0'}
          unit="km"
          color="#ff9800"
        />
        <StatCard
          icon="medal"
          title="Maior Trajeto"
          value={stats?.longest_route?.toFixed(2) || '0'}
          unit="km"
          color="#e91e63"
        />
      </View>
    </ScrollView>
  );
}

interface StatCardProps {
  icon: string;
  title: string;
  value: string;
  unit: string;
  color: string;
}

function StatCard({ icon, title, value, unit, color }: StatCardProps) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <View style={[styles.statIcon, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon as any} size={24} color={color} />
        </View>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
      <View style={styles.statValue}>
        <Text style={[styles.value, { color }]}>
          {value}
          <Text style={styles.unit}> {unit}</Text>
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  statValue: {
    justifyContent: 'center',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
  },
  unit: {
    fontSize: 14,
    fontWeight: '400',
  },
});
