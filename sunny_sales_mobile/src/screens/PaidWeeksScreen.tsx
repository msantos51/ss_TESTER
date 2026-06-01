import React, { useState, useEffect, useContext } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

interface PaidWeek {
  id: number;
  week_start: string;
  week_end: string;
  paid_at: string | null;
}

export default function PaidWeeksScreen() {
  const [weeks, setWeeks] = useState<PaidWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { token, vendor } = useContext(AuthContext);

  const loadWeeks = async () => {
    if (!vendor) return;
    try {
      const res = await api.get(`/vendors/${vendor.id}/paid-weeks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setWeeks(res.data || []);
    } catch (error) {
      console.error('Erro ao carregar semanas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeeks();
  }, [vendor]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWeeks();
    setRefreshing(false);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const renderWeek = ({ item }: { item: PaidWeek }) => (
    <View style={styles.weekCard}>
      <View style={styles.weekContent}>
        <View style={styles.weekIcon}>
          <Ionicons name="calendar" size={20} color="#1976d2" />
        </View>
        <View style={styles.weekInfo}>
          <Text style={styles.weekPeriod}>
            {formatDate(item.week_start)} - {formatDate(item.week_end)}
          </Text>
          {item.paid_at && (
            <Text style={styles.weekPaid}>
              Pago em {formatDate(item.paid_at)}
            </Text>
          )}
        </View>
        <View style={styles.weekStatus}>
          <View style={[styles.statusDot, { backgroundColor: item.paid_at ? '#4caf50' : '#ff9800' }]} />
          <Text style={[styles.statusLabel, { color: item.paid_at ? '#4caf50' : '#ff9800' }]}>
            {item.paid_at ? 'Pago' : 'Pendente'}
          </Text>
        </View>
      </View>
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
      {weeks.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="calendar-outline" size={48} color="#ccc" />
          <Text style={styles.emptyText}>Nenhuma semana registada</Text>
        </View>
      ) : (
        <FlatList
          data={weeks}
          renderItem={renderWeek}
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
  weekCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  weekContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  weekIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  weekInfo: {
    flex: 1,
  },
  weekPeriod: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  weekPaid: {
    fontSize: 12,
    color: '#999',
  },
  weekStatus: {
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
  },
});
