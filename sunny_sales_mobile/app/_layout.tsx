import { Stack } from 'expo-router';
import { AuthProvider } from '../src/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack screenOptions={{ headerStyle: { backgroundColor: '#ffd700' }, headerTintColor: '#000' }}>
        <Stack.Screen name="index" options={{ title: 'Sunny Sales' }} />
      </Stack>
    </AuthProvider>
  );
}
