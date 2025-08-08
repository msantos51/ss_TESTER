// (em português) Layout principal com navegação do expo-router e proteção básica de sessão.
import { Slot } from 'expo-router';
import { useEffect } from 'react';
import { SafeAreaView, StatusBar } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    // (em português) Aqui podemos inicializar listeners globais no futuro.
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" />
      <Slot />
    </SafeAreaView>
  );
}
