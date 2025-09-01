import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthStack from './src/navigation/AuthStack';

/**
 * Componente principal da aplicação.
 * Envolve toda a navegação dentro do NavigationContainer
 * para gerir o estado de navegação.
 */
export default function App() {
  return (
    // NavigationContainer fornece contexto de navegação para toda a app
    <NavigationContainer>
      {/* AuthStack define o fluxo de autenticação (login e registo) */}
      <AuthStack />
    </NavigationContainer>
  );
}
