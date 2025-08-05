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

  // Realiza o fluxo completo de autenticação (obtenção do token e dados do vendedor)
  const attemptLogin = async (force = false) => {
    const payload = { email, password };
    if (force) payload.force = true;
    const tokenRes = await axios.post(`${BASE_URL}/token`, payload);
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

    navigate('/dashboard');
  };

  // login
  // Realiza a autenticação do vendedor
  const login = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      await attemptLogin();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409) {
        const confirmLogout = window.confirm(
          'Já existe uma sessão ativa. Terminar sessão anterior?'
        );
        if (confirmLogout) {
          try {
            await attemptLogin(true);
            return;
          } catch (err2) {
            console.error(err2);
            setError(err2.response?.data?.detail || 'Falha no login');
          }
        } else {
          setError('Sessão já iniciada noutro dispositivo');
        }
      } else if (err.response?.data?.detail) {
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
      <h2 className="title auth-title">Login de Vendedor</h2>
      <p style={{ marginBottom: '1rem', fontStyle: 'italic' }}>
        Esta página destina-se apenas a vendedores.
      </p>

      {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

      <div className="form login-form auth-form">
        <span className="input-span">
          <label className="label">Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
          />
        </span>
        <span className="input-span">
          <label className="label">Palavra-passe</label>
          <input
            type="password"
            placeholder="Palavra-passe"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
          />
        </span>

        <button
          className="submit"
          onClick={login}
          disabled={!email || !password || loading}
        >
          {loading ? <LoadingDots /> : 'Entrar'}
        </button>

        <button
          type="button"
          className="submit"
          onClick={() => navigate('/vendor-register')}
        >
          Registar
        </button>

        <button
          type="button"
          className="submit"
          onClick={() => navigate('/forgot-password')}
          style={{ textDecoration: 'underline' }}
        >
          Esqueci-me da palavra-passe
        </button>
      </div>
    </div>
  );
}

