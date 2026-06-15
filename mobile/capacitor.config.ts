import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.sunnysales.vendor',
  appName: 'Sunny Sales',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    Geolocation: {
      requestPermissions: true,
    },
  },
};

export default config;
