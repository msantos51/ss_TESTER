// src/components/TopBar.tsx
import { View, Text, StyleSheet } from 'react-native';
export default function TopBar({ title = 'Sunny Sales' }) {
  return <View style={styles.bar}><Text style={styles.t}>{title}</Text></View>;
}
const styles = StyleSheet.create({
  bar: { padding: 12, backgroundColor: '#ffd700' },
  t: { fontSize: 18, fontWeight: 'bold' }
});
