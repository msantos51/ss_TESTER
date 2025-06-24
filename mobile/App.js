// App.js - ponto de entrada do aplicativo React Native com navegacao
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';

import VendorLoginScreen from './screens/LoginScreen';
import VendorRegisterScreen from './screens/RegisterScreen';
import ClientLoginScreen from './screens/ClientLoginScreen';
import ClientRegisterScreen from './screens/ClientRegisterScreen';
import ClientDashboardScreen from './screens/ClientDashboardScreen';
import MapScreen from './screens/MapScreen';
import DashboardScreen from './screens/DashboardScreen';
import VendorDetailScreen from './screens/VendorDetailScreen';
import RoutesScreen from './screens/RoutesScreen';
import RouteDetailScreen from './screens/RouteDetailScreen';
import StatsScreen from './screens/StatsScreen';
import TermsScreen from './screens/TermsScreen';
import PaidWeeksScreen from './screens/PaidWeeksScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import AccountSettingsScreen from './screens/AccountSettingsScreen';
import ManageAccountScreen from './screens/ManageAccountScreen';
import AboutScreen from './screens/AboutScreen';
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
          <Stack.Screen name="VendorLogin" component={VendorLoginScreen} />
          <Stack.Screen name="VendorRegister" component={VendorRegisterScreen} />
          <Stack.Screen name="ClientLogin" component={ClientLoginScreen} />
          <Stack.Screen name="ClientRegister" component={ClientRegisterScreen} />
          <Stack.Screen name="ClientDashboard" component={ClientDashboardScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Recuperar Palavra-passe' }} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="Routes" component={RoutesScreen} options={{ title: 'Trajetos' }} />
          <Stack.Screen name="Stats" component={StatsScreen} options={{ title: t('statsTitle') }} />
          <Stack.Screen name="PaidWeeks" component={PaidWeeksScreen} options={{ title: t('paidWeeksTitle') }} />
          <Stack.Screen name="RouteDetail" component={RouteDetailScreen} options={{ title: 'Trajeto' }} />
          <Stack.Screen name="Terms" component={TermsScreen} options={{ title: 'Termos' }} />
          <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} options={{ title: t('accountSettingsTitle') }} />
          <Stack.Screen name="ManageAccount" component={ManageAccountScreen} options={{ title: 'Definições' }} />
          <Stack.Screen name="About" component={AboutScreen} options={{ title: 'Sobre/Ajuda' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
