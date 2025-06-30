// (em português) Página Web para login de vendedores

import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';

export default function VendorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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

      window.location.href = '/dashboard'; // redirecionar para o dashboard
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
      <h2>Login de Vendedor</h2>
      <p style={styles.notice}>Esta página destina-se apenas a vendedores.</p>

      {error && <p style={styles.error}>{error}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); setError(null); }}
        style={styles.input}
      />
      <input
        type="password"
        placeholder="Palavra-passe"
        value={password}
        onChange={(e) => { setPassword(e.target.value); setError(null); }}
        style={styles.input}
      />

      <button onClick={login} disabled={!email || !password || loading} style={styles.button}>
        {loading ? 'A entrar...' : 'Entrar'}
      </button>

      <button onClick={() => window.location.href = '/register'} style={styles.outlinedButton}>
        Registar
      </button>

      <button onClick={() => window.location.href = '/forgot-password'} style={styles.textButton}>
        Esqueci-me da palavra-passe
      </button>
    </div>
  );
}

// (em português) Estilos simples para versão Web
const styles = {
  container: {
    maxWidth: '400px',
    margin: '3rem auto',
    padding: '2rem',
    border: '1px solid #ccc',
    borderRadius: '12px',
    backgroundColor: '#fff',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '1rem',
    borderRadius: '8px',
    border: '1px solid #ccc',
  },
  button: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#FDC500',
    color: '#000',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '1rem',
  },
  outlinedButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: 'white',
    border: '2px solid #FDC500',
    color: '#000',
    fontWeight: 'bold',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '1rem',
  },
  textButton: {
    background: 'none',
    border: 'none',
    color: '#007BFF',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginBottom: '1rem',
  },
  notice: {
    marginBottom: '1rem',
    fontStyle: 'italic',
  },
};
