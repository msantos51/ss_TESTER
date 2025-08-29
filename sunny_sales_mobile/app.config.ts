// app.config.ts
import { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'Sunny Sales',
  slug: 'sunny-sales',
  version: '0.1.0',
  scheme: 'sunnysales',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  extra: {
    EXPO_PUBLIC_BASE_URL: process.env.EXPO_PUBLIC_BASE_URL ?? 'https://ss-tester.onrender.com',
  },
  ios: {
    supportsTablet: false,
    // (se usares localização em background no iOS, adiciona os strings aqui)
    // infoPlist: {
    //   NSLocationWhenInUseUsageDescription: 'Usamos a sua localização para mostrar vendedores próximos.',
    //   NSLocationAlwaysAndWhenInUseUsageDescription: 'Partilhamos localização em tempo real quando ativa o modo vendedor.',
    // },
  },
  android: {
    package: 'com.sunny.sales',
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'FOREGROUND_SERVICE',
      'ACCESS_BACKGROUND_LOCATION', // ok se precisares de localização em 2º plano
      // 👇 REMOVIDO (NÃO usar — causa crash no Android 14)
      // 'android.permission.DETECT_SCREEN_CAPTURE',
    ],
    // (se fizeres tracking em 1º plano contínuo, define a notificação do serviço)
    // foregroundService: {
    //   notificationTitle: 'Sunny Sales',
    //   notificationBody: 'A atualizar a sua localização…',
    // },
  },
  plugins: [
    'expo-router',
    'expo-location',
    // NÃO adicionar expo-screen-capture aqui (a menos que protejas as chamadas por versão)
  ],
};

export default config;
