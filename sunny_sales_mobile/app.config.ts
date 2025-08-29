// app.config.ts
// Configuração principal da aplicação Expo
import { ExpoConfig } from 'expo/config';

// Objeto de configuração exportado para definir metadados e permissões
const config: ExpoConfig = {
  // Nome apresentado da aplicação
  name: 'Sunny Sales',
  // Identificador amigável utilizado pelo Expo
  slug: 'sunny-sales',
  // Versão da aplicação
  version: '0.1.0',
  // Esquema de URI para deep linking
  scheme: 'sunnysales',
  // Orientação padrão do ecrã
  orientation: 'portrait',
  // Ícone da aplicação
  icon: './assets/icon.png',
  // Tema visual global
  userInterfaceStyle: 'light',
  // Variáveis extras partilhadas com a aplicação
  extra: {
    EXPO_PUBLIC_BASE_URL: process.env.EXPO_PUBLIC_BASE_URL ?? 'https://ss-tester.onrender.com'
  },
  // Configurações específicas para iOS
  ios: { supportsTablet: false },
  // Configurações específicas para Android
  android: {
    // Identificador do pacote Android
    package: 'com.sunny.sales',
    // Lista de permissões necessárias para o funcionamento da app
    permissions: [
      'ACCESS_FINE_LOCATION',
      'ACCESS_COARSE_LOCATION',
      'FOREGROUND_SERVICE',
      'ACCESS_BACKGROUND_LOCATION',
    ]
  },
  // Plugins Expo utilizados pela aplicação
  plugins: ['expo-router', 'expo-location']
};

// Exporta a configuração para ser utilizada pelo Expo
export default config;
