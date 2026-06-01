import React, { useContext } from 'react';
import { TouchableOpacity } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import MapScreen from '../screens/MapScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import RoutesScreen from '../screens/RoutesScreen';
import StatsScreen from '../screens/StatsScreen';
import SessionsScreen from '../screens/SessionsScreen';
import AccountScreen from '../screens/AccountScreen';
import TermsScreen from '../screens/TermsScreen';
import PaidWeeksScreen from '../screens/PaidWeeksScreen';
import InvoicesScreen from '../screens/InvoicesScreen';
import { AuthContext } from '../context/AuthContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function VendorTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color }) => {
          let iconName;
          if (route.name === 'DashboardTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'MapTab') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'RoutesTab') {
            iconName = focused ? 'navigate' : 'navigate-outline';
          } else if (route.name === 'StatsTab') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          }
          return <Ionicons name={iconName} size={24} color={color} />;
        },
        tabBarActiveTintColor: '#1976d2',
        tabBarInactiveTintColor: '#888',
        headerShown: true,
      })}
    >
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapScreen}
        options={{ title: 'Mapa' }}
      />
      <Tab.Screen
        name="RoutesTab"
        component={RoutesScreen}
        options={{ title: 'Trajetos' }}
      />
      <Tab.Screen
        name="StatsTab"
        component={StatsScreen}
        options={{ title: 'Estatísticas' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { token } = useContext(AuthContext);

  return (
    <Stack.Navigator>
      {token ? (
        <>
          <Stack.Screen
            name="VendorHome"
            component={VendorTabs}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="Account"
            component={AccountScreen}
            options={{ title: 'Dados Pessoais' }}
          />
          <Stack.Screen
            name="Sessions"
            component={SessionsScreen}
            options={{ title: 'Sessões' }}
          />
          <Stack.Screen
            name="PaidWeeks"
            component={PaidWeeksScreen}
            options={{ title: 'Semanas Pagas' }}
          />
          <Stack.Screen
            name="Invoices"
            component={InvoicesScreen}
            options={{ title: 'Faturas' }}
          />
          <Stack.Screen
            name="Terms"
            component={TermsScreen}
            options={{ title: 'Termos e Condições' }}
          />
        </>
      ) : (
        <>
          <Stack.Screen
            name="Map"
            component={MapScreen}
            options={({ navigation }) => ({
              title: 'Sunny Sales',
              headerRight: () => (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Login')}
                >
                  <Ionicons name="person-circle-outline" size={24} />
                </TouchableOpacity>
              ),
            })}
          />
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ title: 'Login' }}
          />
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{ title: 'Registar' }}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
