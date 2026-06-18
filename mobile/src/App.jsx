import React, { useState, useEffect } from 'react';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import MapView from './pages/MapView.jsx';

export default function App() {
  const [auth, setAuth] = useState(null);
  const [tab, setTab] = useState('dashboard');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const vendorId = localStorage.getItem('vendorId');
    if (token && user && vendorId) {
      setAuth({ token, user: JSON.parse(user), vendorId });
    }
  }, []);

  const handleLogin = ({ token, user, vendorId }) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('vendorId', vendorId.toString());
    setAuth({ token, user, vendorId });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('vendorId');
    setAuth(null);
  };

  if (!auth) return <Login onLogin={handleLogin} />;

  return (
    <div className="app-shell">
      <div className="app-shell-content">
        {tab === 'dashboard' ? (
          <Dashboard auth={auth} onLogout={handleLogout} />
        ) : (
          <MapView />
        )}
      </div>
      <nav className="bottom-nav">
        <button
          className={`bottom-nav-item ${tab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setTab('dashboard')}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 9.5 12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V9.5Z" />
          </svg>
          Início
        </button>
        <button
          className={`bottom-nav-item ${tab === 'map' ? 'active' : ''}`}
          onClick={() => setTab('map')}
        >
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="10" r="3" />
            <path d="M12 21s7-6.5 7-11.5A7 7 0 0 0 5 9.5C5 14.5 12 21 12 21Z" />
          </svg>
          Mapa
        </button>
      </nav>
    </div>
  );
}
