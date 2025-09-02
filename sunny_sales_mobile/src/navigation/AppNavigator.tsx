import React, { useContext } from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import MapScreen from '../screens/MapScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import { AuthContext } from '../context/AuthContext';

// Cria uma stack para ecrãs principais
const Stack = createNativeStackNavigator();

/**
 * Componente que define as rotas principais da aplicação.
 * O mapa é o ecrã inicial e o perfil é acedido através de um ícone no canto superior direito.
 */
export default function AppNavigator() {
  // Obtém token para verificar se o vendedor está autenticado
  const { token } = useContext(AuthContext);

  return (
    // Stack.Navigator organiza os ecrãs principais
    <Stack.Navigator initialRouteName="Map">
      {/* Ecrã do mapa com ícone de perfil no topo direito */}
      <Stack.Screen
        name="Map"
        component={MapScreen}
        options={({ navigation }) => ({
          title: 'Sunny Sales',
          headerRight: () => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate(token ? 'Dashboard' : 'Login')
              }
            >
              <Ionicons name="person-circle-outline" size={24} />
            </TouchableOpacity>
          ),
        })}
      />
      {/* Ecrã de login */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Login' }}
      />
      {/* Ecrã de registo */}
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{ title: 'Register' }}
      />
      {/* Ecrã do dashboard do vendedor */}
      <Stack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
    </Stack.Navigator>
  );
}
