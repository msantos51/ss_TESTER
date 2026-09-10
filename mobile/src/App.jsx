import React, { useState, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import WelcomeScreen from './pages/WelcomeScreen.jsx';
import RegisterScreen from './pages/RegisterScreen.jsx';
import Login from './pages/Login.jsx';
import MapTab from './pages/MapTab.jsx';
import DashboardScreen from './pages/DashboardScreen.jsx';

export default function App() {
  const [auth, setAuth] = useState(null);
  // Ecrã público (sem sessão): boas-vindas, registo ou início de sessão.
  const [publicPage, setPublicPage] = useState('welcome');
  // Ecrã do vendedor autenticado: mapa (partilha) ou dashboard.
  const [activePage, setActivePage] = useState('map');
  const [prefilledEmail, setPrefilledEmail] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const vendorId = localStorage.getItem('vendorId');
    if (token && user && vendorId) {
      setAuth({ token, user: JSON.parse(user), vendorId });
      setActivePage('map');
      requestLocationPermissions();
    }
  }, []);

  const requestLocationPermissions = async () => {
    try {
      const result = await Geolocation.requestPermissions();
      if (result.location === 'granted') {
        localStorage.setItem('locationPermissionGranted', 'true');
      }
    } catch (error) {
      console.error('Erro ao solicitar permissões de localização:', error);
    }
  };

  const handleLogin = ({ token, user, vendorId }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('vendorId', vendorId.toString());
    setAuth({ token, user, vendorId });
    setActivePage('map');
    requestLocationPermissions();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('vendorId');
    setAuth(null);
    setPublicPage('welcome');
  };

  const handleUserUpdate = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setAuth((prev) => ({ ...prev, user: updatedUser }));
  };

  // Depois do registo o vendedor confirma o email e entra com as credenciais.
  const handleRegistered = (email) => {
    setPrefilledEmail(email);
    setPublicPage('login');
  };

  if (!auth) {
    if (publicPage === 'login') {
      return (
        <Login
          initialEmail={prefilledEmail}
          onLogin={handleLogin}
          onBack={() => setPublicPage('welcome')}
          onRegister={() => setPublicPage('register')}
        />
      );
    }
    if (publicPage === 'register') {
      return (
        <RegisterScreen
          onBack={() => setPublicPage('welcome')}
          onRegistered={handleRegistered}
        />
      );
    }
    return (
      <WelcomeScreen
        onLogin={() => setPublicPage('login')}
        onRegister={() => setPublicPage('register')}
      />
    );
  }

  return activePage === 'map' ? (
    <MapTab
      auth={auth}
      onChangePage={setActivePage}
      onLogout={handleLogout}
      onUserUpdate={handleUserUpdate}
    />
  ) : (
    <DashboardScreen
      auth={auth}
      onChangePage={setActivePage}
      onLogout={handleLogout}
      onUserUpdate={handleUserUpdate}
    />
  );
}
