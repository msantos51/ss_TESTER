import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

// Cria uma stack para ecrãs de autenticação
const Stack = createNativeStackNavigator();

/**
 * Componente que define as rotas de autenticação.
 */
export default function AuthStack() {
  return (
    // Stack.Navigator organiza os ecrãs de login e registo
    <Stack.Navigator initialRouteName="Login">
      {/* Ecrã de login */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      {/* Ecrã de registo */}
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}
