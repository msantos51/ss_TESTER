// Definições de tema para React Native Paper
import { MD3LightTheme as DefaultTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  ios: {
    regular: { fontFamily: 'Inter_400Regular', fontWeight: 'normal' },
    medium: { fontFamily: 'Inter_500Medium', fontWeight: 'normal' },
    light: { fontFamily: 'Inter_300Light', fontWeight: 'normal' },
    thin: { fontFamily: 'Inter_100Thin', fontWeight: 'normal' },
  },
  android: {
    regular: { fontFamily: 'Inter_400Regular', fontWeight: 'normal' },
    medium: { fontFamily: 'Inter_500Medium', fontWeight: 'normal' },
    light: { fontFamily: 'Inter_300Light', fontWeight: 'normal' },
    thin: { fontFamily: 'Inter_100Thin', fontWeight: 'normal' },
  },
};

export const theme = {
  ...DefaultTheme,
  roundness: 8,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FDC500',    // Amarelo solar moderno
    accent: '#0077B6',     // Azul mar moderno
    background: '#FAFAFA', // Fundo branco moderno
    surface: '#FFFFFF',
    text: '#212121',       // Cinzento escuro para melhor leitura
    error: '#D32F2F',
    onPrimary: '#000000',
    onSecondary: '#FFFFFF',
    onSurface: '#212121',
  },
  fonts: configureFonts(fontConfig),
};