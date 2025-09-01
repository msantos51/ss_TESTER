import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

/**
 * Ecrã de registo simples.
 * Será substituído posteriormente pela implementação real.
 */
export default function RegisterScreen() {
  return (
    // View principal do ecrã
    <View style={styles.container}>
      {/* Texto temporário para indicar o ecrã */}
      <Text>Register Screen</Text>
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
