// (em português) Página de login do cliente na versão web

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaGoogle, FaApple } from 'react-icons/fa';
import axios from 'axios';
import { BASE_URL } from '../config';
import LoadingDots from '../components/LoadingDots';

// Componente de login para clientes
export default function ClientLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Tokens JWT de demonstração para login social
  const GOOGLE_TOKEN =
    'eyJhbGciOiJub25lIn0.eyJlbWFpbCI6Im9hdXRoQGV4YW1wbGUuY29tIiwibmFtZSI6Ik9BdXRoIENsaWVudCIsInN1YiI6ImdpZDEyMyJ9.';
  const APPLE_TOKEN =
    'eyJhbGciOiJub25lIn0.eyJlbWFpbCI6Im9hdXRoQGV4YW1wbGUuY29tIiwibmFtZSI6Ik9BdXRoIENsaWVudCIsInN1YiI6ImFpZDEyMyJ9.';

  // (em português) Função para extrair o ID do token JWT
  const getIdFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.sub;
    } catch (e) {
      console.error('Erro ao decodificar token:', e);
      return null;
    }
  };

  // Tenta autenticar o cliente no backend
  const login = async () => {
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await axios.post(`${BASE_URL}/client-token`, { email, password });
      const token = resp.data.access_token;
      localStorage.setItem('clientToken', token);
      const clientId = getIdFromToken(token);

      let client = { id: clientId, email };

      if (clientId) {
        try {
          const details = await axios.get(`${BASE_URL}/clients/${clientId}`);
          client = details.data;
        } catch (e) {
          console.log('Erro ao obter cliente:', e);
        }
      }

      localStorage.setItem('client', JSON.stringify(client));
      // remove any previous vendor session data
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('vendorId');
      localStorage.removeItem('sharingLocation');
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

  // Login social usando tokens de exemplo
  const oauthLogin = async (provider) => {
    const token = provider === 'google' ? GOOGLE_TOKEN : APPLE_TOKEN;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.append('provider', provider);
      params.append('token', token);
      const resp = await axios.post(`${BASE_URL}/client-oauth`, params);
      const access = resp.data.access_token;
      localStorage.setItem('clientToken', access);
      const clientId = getIdFromToken(access);
      const { data: client } = await axios.get(`${BASE_URL}/clients/${clientId}`);
      localStorage.setItem('client', JSON.stringify(client));
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError('Falha no login social');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-box">
      <h2 className="title auth-title">Login do Cliente</h2>
      {error && (
        <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
      )}
<div className="form login-form auth-form">

        <div className="form-container login-container">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            className="input"
          />
          <input
            type="password"
            placeholder="Palavra-passe"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            className="input"
          />
        </div>
        <button
          className="black-button"
          onClick={login}
          disabled={!email || !password || loading}
        >
          {loading ? <LoadingDots /> : 'Entrar'}
        </button>
        <button
          type="button"
          className="black-button"
          onClick={() => navigate('/register')}
        >
          Registar
        </button>

        <div className="buttons-container">
          <button
            type="button"
            className="black-button"
            onClick={() => oauthLogin('google')}
          >
            <FaGoogle className="google-icon" /> Entrar com Google
          </button>
          <button type="button" className="black-button">
            <FaApple className="apple-icon" /> Entrar com Apple
          </button>
        </div>
      </div>
    </div>
  );
}

