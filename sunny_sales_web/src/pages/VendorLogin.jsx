// (em português) Página Web para login de vendedores

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../config';
import LoadingDots from '../components/LoadingDots';

// Componente de login dedicado aos vendedores
export default function VendorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // (em português) Decodifica o token JWT para extrair o ID do vendedor
  const getVendorIdFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch (e) {
      console.error('Erro ao decodificar o token:', e);
      return null;
    }
  };

  // login
  // Realiza a autenticação do vendedor
  const login = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      const tokenRes = await axios.post(`${BASE_URL}/token`, { email, password });
      const token = tokenRes.data.access_token;
      localStorage.setItem('token', token);

      const vendorId = getVendorIdFromToken(token);
      if (vendorId) {
        localStorage.setItem('vendorId', vendorId.toString());
      }

      const userRes = await axios.post(`${BASE_URL}/login`, { email, password });
      localStorage.setItem('user', JSON.stringify(userRes.data));
      // remove any previous client session data
      localStorage.removeItem('client');
      localStorage.removeItem('clientToken');
      localStorage.removeItem('favorites');

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      if (err.response?.data?.detail) {
        setError(err.response.data.detail);
      } else {
        setError('Falha no login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-box">
      <h2 className="title">Login de Vendedor</h2>
      <p style={{ marginBottom: '1rem', fontStyle: 'italic' }}>
        Esta página destina-se apenas a vendedores.
      </p>

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

<div className="form login-form">

        <div className="form-container login-container">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            className="input"
          />
          <input
            type="password"
            placeholder="Palavra-passe"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            className="input"
          />
        </div>

        <button onClick={login} disabled={!email || !password || loading}>
          {loading ? <LoadingDots /> : 'Entrar'}
        </button>

        <button
          type="button"
          className="outlined-button"
          onClick={() => navigate('/register')}
        >
          Registar
        </button>

        <button
          type="button"
          className="outlined-button"
          onClick={() => navigate('/forgot-password')}
          style={{ background: 'none', border: 'none', color: '#19a0a4', textDecoration: 'underline' }}
        >
          Esqueci-me da palavra-passe
        </button>
      </div>
    </div>
  );
}

