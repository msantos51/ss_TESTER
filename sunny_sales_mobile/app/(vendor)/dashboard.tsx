import { View, Text, StyleSheet } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import TopBar from '../../src/components/TopBar';
import { api } from '../../src/services/api';
import { Vendor } from '../../src/types';
import { useAuth } from '../../src/hooks/useAuth';

export default function VendorDashboard() {
  const { token } = useAuth();
  const router = useRouter();
  const [vendor, setVendor] = useState<Vendor | null>(null);

  useEffect(() => {
    if (!token) {
      router.replace('/(auth)/login');
      return;
    }
    api.get('/vendors/me')
      .then((res) => setVendor(res.data))
      .catch(() => setVendor(null));
  }, [token]);

  return (
    <View style={styles.container}>
      <TopBar title="Dashboard" />
      {vendor ? (
        <View style={styles.content}>
          <Text style={styles.name}>{vendor.name}</Text>
          <Text>{vendor.product}</Text>
        </View>
      ) : (
        <Text>Loading...</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 8 },
  name: { fontSize: 20, fontWeight: 'bold' },
});

