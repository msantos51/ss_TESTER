// (em português) Configuração Expo da app: nome, ícones e variáveis públicas (BASE_URL).
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
    // (em português) Define a URL do backend; pode ser substituída por variável de ambiente.
    EXPO_PUBLIC_BASE_URL: process.env.EXPO_PUBLIC_BASE_URL ?? 'https://ss-tester.onrender.com'
  },
  experiments: {
    typedRoutes: true
  },
  ios: {
    supportsTablet: false
  },
  android: {
    package: 'com.sunny.sales',
    permissions: [
      "ACCESS_FINE_LOCATION",
      "ACCESS_COARSE_LOCATION",
      "FOREGROUND_SERVICE",
      "ACCESS_BACKGROUND_LOCATION"
    ]
  },
  plugins: [
    'expo-router',
    'expo-location'
  ]
};

export default config;
