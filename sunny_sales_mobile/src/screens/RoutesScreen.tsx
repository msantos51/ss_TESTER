import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import api, { BASE_URL } from '../services/api';

interface Route {
  id: number;
  started_at: string;
  stopped_at: string | null;
  distance: number;
  vendor_id: number;
}

export default function RoutesScreen() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token, vendor } = useContext(AuthContext);

  const loadRoutes = async () => {
    if (!vendor) return;
    try {
      const res = await api.get(`/vendors/${vendor.id}/routes`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoutes(res.data || []);
    } catch (error) {
      console.error('Erro ao carregar trajetos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, [vendor]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRoutes();
    setRefreshing(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-PT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderRoute = ({ item }: { item: Route }) => (
    <View style={styles.routeCard}>
      <View style={styles.routeHeader}>
        <View style={styles.routeIcon}>
          <Ionicons name="navigate" size={20} color="#1976d2" />
        </View>
        <View style={styles.routeInfo}>
          <Text style={styles.routeDate}>{formatDate(item.started_at)}</Text>
          <Text style={styles.routeDistance}>{item.distance?.toFixed(2) || '0.00'} km</Text>
        </View>
      </View>
      {item.stopped_at && (
        <Text style={styles.routeStatus}>Finalizado em {formatDate(item.stopped_at)}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {routes.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="navigate-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Nenhum trajeto registado</Text>
        </View>
      ) : (
        <FlatList
          data={routes}
          renderItem={renderRoute}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
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
  listContent: {
    padding: 16,
  },
  routeCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  routeDistance: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976d2',
  },
  routeStatus: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
});
