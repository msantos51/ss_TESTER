// (em português) Página de login do cliente na versão web

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../config';

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
    <div style={styles.container}>
      <h2 style={styles.title}>Login do Cliente</h2>
      {error && <p style={styles.error}>{error}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          setError(null);
        }}
        style={styles.input}
      />

      <input
        type="password"
        placeholder="Palavra-passe"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setError(null);
        }}
        style={styles.input}
      />

      <button onClick={login} style={styles.button} disabled={!email || !password || loading}>
        {loading ? 'A carregar...' : 'Entrar'}
      </button>

      <button onClick={() => navigate('/register')} style={styles.outlinedButton}>
        Registar
      </button>
    </div>
  );
}

// (em português) Estilos embutidos
const styles = {
  container: {
    maxWidth: '400px',
    margin: '5rem auto',
    padding: '2rem',
    backgroundColor: '#f6f6f6',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    textAlign: 'center',
  },
  title: {
    marginBottom: '1.5rem',
  },
  input: {
    display: 'block',
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '1rem',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#f9c200',
    color: '#000',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    marginBottom: '1rem',
  },
  outlinedButton: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: 'white',
    color: '#333',
    border: '1px solid #ccc',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  error: {
    color: 'red',
    marginBottom: '1rem',
  },
};
