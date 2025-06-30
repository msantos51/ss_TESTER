// (em português) Página para recuperação de palavra-passe
import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const requestReset = async () => {
    if (!email) return;
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      await axios.post(`${BASE_URL}/password-reset-request`, { email });
      setMessage('Verifique o seu e-mail para definir nova palavra-passe.');
    } catch (err) {
      console.error(err);
      setError('Falha ao solicitar recuperação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>Recuperar Palavra-passe</h2>
      {error && <p style={styles.error}>{error}</p>}
      {message && <p style={styles.success}>{message}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={styles.input}
      />

      <button
        onClick={requestReset}
        disabled={loading || !email}
        style={styles.button}
      >
        {loading ? 'A enviar...' : 'Enviar'}
      </button>
    </div>
  );
}

// (em português) Estilos básicos para a página
const styles = {
  container: {
    maxWidth: 400,
    margin: '2rem auto',
    padding: '2rem',
    border: '1px solid #ccc',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    fontSize: '1rem',
    marginBottom: '1rem',
    borderRadius: 4,
    border: '1px solid #ccc',
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    fontSize: '1rem',
    backgroundColor: '#f9c200',
    border: 'none',
    borderRadius: 4,
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    marginBottom: '1rem',
  },
  success: {
    color: 'green',
    marginBottom: '1rem',
  },
};
