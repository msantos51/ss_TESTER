import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Ecrã de login simples.
 * Será substituído posteriormente pela implementação real.
 */
export default function LoginScreen() {
  return (
    // View principal do ecrã
    <View style={styles.container}>
      {/* Texto temporário para indicar o ecrã */}
      <Text>Login Screen</Text>
    </View>
  );
}

// Estilos utilizados neste ecrã
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
