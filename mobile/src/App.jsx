import React, { useState, useEffect } from 'react';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';

export default function App() {
  const [auth, setAuth] = useState(null);

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
  return <Dashboard auth={auth} onLogout={handleLogout} />;
}
