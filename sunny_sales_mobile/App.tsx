import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, Text, Button, StyleSheet } from 'react-native';
import AuthStack from './src/navigation/AuthStack';
import { AuthProvider, AuthContext } from './src/context/AuthContext';

/**
 * Componente que decide qual o fluxo de navegação com base no token.
 */
function RootNavigator() {
  // Obtém token e função de logout a partir do contexto
  const { token, logout } = useContext(AuthContext);

  // Se existir token, mostra um ecrã simples autenticado
  if (token) {
    return (
      <View style={styles.center}>
        {/* Texto de exemplo para utilizador autenticado */}
        <Text>Bem-vindo!</Text>
        {/* Botão para terminar sessão */}
        <Button title="Logout" onPress={logout} />
      </View>
    );
  }

  // Caso não exista token, apresenta o fluxo de autenticação
  return <AuthStack />;
}

/**
 * Componente principal da aplicação.
 * Envolve toda a navegação e o contexto de autenticação.
 */
export default function App() {
  return (
    // AuthProvider disponibiliza o estado de autenticação à aplicação inteira
    <AuthProvider>
      {/* NavigationContainer gere o estado de navegação */}
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}

// Estilos utilizados para centrar conteúdos
const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
