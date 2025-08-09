// src/components/VendorCard.tsx
import { View, Text, StyleSheet, Image } from 'react-native';
import { Vendor } from '../types';
export default function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <View style={styles.card}>
      {vendor.photo_url ? <Image source={{ uri: vendor.photo_url }} style={styles.img} /> : null}
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{vendor.name}</Text>
        <Text>{vendor.product}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: 12, padding: 12, backgroundColor: '#fff3b0', borderRadius: 12, alignItems: 'center' },
  img: { width: 48, height: 48, borderRadius: 24 },
  name: { fontWeight: 'bold' }
});
