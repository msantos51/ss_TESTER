import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/context/AuthContext';

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
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}
