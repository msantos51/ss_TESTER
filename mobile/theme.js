// Definicoes de tema para React Native Paper
import { DefaultTheme, configureFonts } from 'react-native-paper';

const fontConfig = {
  default: {
    regular: { fontFamily: 'Roboto', fontWeight: '400' },
    medium: { fontFamily: 'Roboto', fontWeight: '500' },
    light: { fontFamily: 'Roboto', fontWeight: '300' },
    thin: { fontFamily: 'Roboto', fontWeight: '100' },
  },
};

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#FDC500',   // Amarelo solar moderno
    accent: '#0077B6',    // Azul mar moderno
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
