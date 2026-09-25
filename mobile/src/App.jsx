import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import WelcomeScreen from './pages/WelcomeScreen.jsx';
import RegisterScreen from './pages/RegisterScreen.jsx';
import Login from './pages/Login.jsx';
import MapTab from './pages/MapTab.jsx';
import DashboardScreen from './pages/DashboardScreen.jsx';
import ProductsScreen from './pages/ProductsScreen.jsx';
import PremiumScreen from './pages/PremiumScreen.jsx';
import QRScreen from './pages/QRScreen.jsx';
import TabBar from './components/TabBar.jsx';
import { BASE_URL } from './config.js';

export default function App() {
  const [auth, setAuth] = useState(null);
  // Ecrã público (sem sessão): boas-vindas, registo ou início de sessão.
  const [publicPage, setPublicPage] = useState('welcome');
  // Separador ativo do vendedor autenticado.
  const [activeTab, setActiveTab] = useState('map');
  // Separadores já abertos pelo menos uma vez. O mapa fica sempre montado
  // para não perder o estado da partilha; os restantes só são montados na
  // primeira visita, mas ficam montados a partir daí.
  const [visitedTabs, setVisitedTabs] = useState(() => new Set(['map']));
  const [prefilledEmail, setPrefilledEmail] = useState('');
  // O botão de sair vive agora na Conta, mas quem sabe parar a partilha é o
  // mapa — que fica montado. O mapa regista aqui a sua função de paragem.
  const stopSharingRef = useRef(null);
  const registerStopSharing = useCallback((fn) => {
    stopSharingRef.current = fn;
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const vendorId = localStorage.getItem('vendorId');
    if (token && user && vendorId) {
      let savedUser = null;
      try { savedUser = JSON.parse(user); } catch { /* estado corrompido */ }
      if (!savedUser) {
        clearStoredSession();
        return;
      }
      setAuth({ token, user: savedUser, vendorId });
      setActiveTab('map');
      requestLocationPermissions();
      refreshStoredSession(token);
    }
  }, []);

  // A sessão guardada pode já não ser válida (foi terminada noutro
  // dispositivo, ou a conta foi eliminada no site): sem esta verificação a
  // app abria como se estivesse tudo bem e cada ação falhava com 401. Serve
  // também para trazer o estado atual do Premium. Sem rede mantém-se o que
  // está guardado — a app tem de abrir na praia mesmo com 4G fraca.
  const refreshStoredSession = async (token) => {
    try {
      const res = await fetch(`${BASE_URL}/vendors/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        clearStoredSession();
        setAuth(null);
        setPublicPage('login');
        return;
      }
      if (res.ok) {
        const fresh = await res.json();
        localStorage.setItem('user', JSON.stringify(fresh));
        setAuth((prev) => (prev && prev.token === token ? { ...prev, user: fresh } : prev));
      }
    } catch {
      /* sem rede: fica o utilizador guardado */
    }
  };

  const clearStoredSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('vendorId');
  };

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

  const goToTab = (tab) => {
    setActiveTab(tab);
    setVisitedTabs((prev) => (prev.has(tab) ? prev : new Set(prev).add(tab)));
  };

  const handleLogin = ({ token, user, vendorId }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('vendorId', vendorId.toString());
    setAuth({ token, user, vendorId });
    setActiveTab('map');
    setVisitedTabs(new Set(['map']));
    requestLocationPermissions();
  };

  const handleLogout = async () => {
    try {
      await stopSharingRef.current?.();
    } catch (error) {
      console.error('Erro ao parar a partilha antes de sair:', error);
    }
    clearStoredSession();
    setAuth(null);
    setPublicPage('welcome');
    setActiveTab('map');
    setVisitedTabs(new Set(['map']));
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

  const panels = useMemo(() => {
    if (!auth) return [];
    return [
      {
        id: 'map',
        node: (
          <MapTab
            auth={auth}
            onChangePage={goToTab}
            onLogout={handleLogout}
            onUserUpdate={handleUserUpdate}
            registerStopSharing={registerStopSharing}
          />
        ),
      },
      { id: 'products', node: <ProductsScreen auth={auth} onGoPremium={() => goToTab('premium')} /> },
      {
        id: 'premium',
        node: <PremiumScreen auth={auth} onUserUpdate={handleUserUpdate} />,
      },
      { id: 'qr', node: <QRScreen auth={auth} onGoPremium={() => goToTab('premium')} /> },
      {
        id: 'account',
        node: (
          <DashboardScreen
            auth={auth}
            onChangePage={goToTab}
            onLogout={handleLogout}
            onUserUpdate={handleUserUpdate}
          />
        ),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth]);

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

  return (
    <div className="app-shell">
      <div className="app-tab-panels">
        {panels.map(({ id, node }) =>
          visitedTabs.has(id) ? (
            <div
              key={id}
              className="app-tab-panel"
              hidden={activeTab !== id}
              aria-hidden={activeTab !== id}
            >
              {node}
            </div>
          ) : null
        )}
      </div>
      <TabBar active={activeTab} onChange={goToTab} />
    </div>
  );
}
