import React, { useState, useEffect } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import Login from './pages/Login.jsx';
import MapTab from './pages/MapTab.jsx';
import DashboardScreen from './pages/DashboardScreen.jsx';

export default function App() {
  const [auth, setAuth] = useState(null);
  const [activePage, setActivePage] = useState('map');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const vendorId = localStorage.getItem('vendorId');
    if (token && user && vendorId) {
      setAuth({ token, user: JSON.parse(user), vendorId });
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
    requestLocationPermissions();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('vendorId');
    setAuth(null);
  };

  const handleUserUpdate = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setAuth((prev) => ({ ...prev, user: updatedUser }));
  };

  if (!auth) return <Login onLogin={handleLogin} />;

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
