// app/index.tsx
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import BeachConditions from '../src/components/BeachConditions';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sunny Sales</Text>
      <Link href="/(client)/map" asChild>
        <TouchableOpacity style={styles.btn}><Text>Mapa Público</Text></TouchableOpacity>
      </Link>
      <Link href="/(auth)/login" asChild>
        <TouchableOpacity style={styles.btn}><Text>Login Vendedor</Text></TouchableOpacity>
      </Link>
      <Link href="/(vendor)/dashboard" asChild>
        <TouchableOpacity style={styles.btn}><Text>Dashboard Vendedor</Text></TouchableOpacity>
      </Link>
      <BeachConditions />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, gap: 16, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, fontWeight: 'bold' },
  btn: { backgroundColor: '#ffd700', padding: 12, borderRadius: 8 }
});
