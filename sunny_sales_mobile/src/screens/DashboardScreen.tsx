import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

/**
 * Ecrã principal apresentado ao vendedor autenticado.
 */
export default function DashboardScreen() {
  // Obtém os dados do vendedor e a função de logout
  const { vendor, logout } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      {/* Título do dashboard */}
      <Text style={styles.title}>Dashboard</Text>
      {/* Informação básica do vendedor */}
      {vendor && (
        <Text style={styles.info}>
          {`Bem-vindo, ${vendor.name}! Produto: ${vendor.product}`}
        </Text>
      )}
      {/* Botão para terminar sessão */}
      <TouchableOpacity style={styles.button} onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

/**
 * Estilos aplicados ao ecrã de dashboard.
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  info: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});
