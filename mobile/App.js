// App.js - ponto de entrada do aplicativo React Native com navegacao
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import MapScreen from './screens/MapScreen';
import DashboardScreen from './screens/DashboardScreen';
import VendorDetailScreen from './screens/VendorDetailScreen';
import RoutesScreen from './screens/RoutesScreen';
import RouteDetailScreen from './screens/RouteDetailScreen';
import StatsScreen from './screens/StatsScreen';
import TermsScreen from './screens/TermsScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import { theme } from './theme';
import t from './i18n';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Map">
          <Stack.Screen
            name="Map"
            component={MapScreen}
            options={{ title: 'Sunny Sales', headerTitleAlign: 'center' }}
          />
          <Stack.Screen
            name="VendorDetail"
            component={VendorDetailScreen}
            options={{ title: 'Vendedor' }}
          />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Recuperar Password' }} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Routes" component={RoutesScreen} options={{ title: 'Trajetos' }} />
          <Stack.Screen name="Stats" component={StatsScreen} options={{ title: t('statsTitle') }} />
          <Stack.Screen name="RouteDetail" component={RouteDetailScreen} options={{ title: 'Trajeto' }} />
          <Stack.Screen name="Terms" component={TermsScreen} options={{ title: 'Termos' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
