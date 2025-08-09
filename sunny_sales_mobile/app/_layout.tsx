// app/_layout.tsx
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: '#ffd700' }, headerTintColor: '#000' }}>
      <Stack.Screen name="index" options={{ title: 'Sunny Sales' }} />
    </Stack>
  );
}
