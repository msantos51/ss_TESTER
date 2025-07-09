// (em português) Página de login do cliente na versão web

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../config';
import LoadingDots from '../components/LoadingDots';

export default function ClientLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className="form-box">
      <h2 className="title">Login do Cliente</h2>
      {error && (
        <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
      )}
<div className="form login-form">

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
      </div>
    </div>
  );
}

