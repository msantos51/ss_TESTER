// (em português) Layout raiz do expo-router com navegação em pilha e header escondido.
import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
