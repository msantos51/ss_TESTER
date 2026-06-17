// (em português) Página para recuperação de palavra-passe
import React, { useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import LoadingDots from '../components/LoadingDots';
import './VendorLogin.css';

// Página para solicitar reposição da palavra-passe
export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Envia pedido de redefinição de palavra-passe
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
    <div className="form-box">
      <h2 className="title auth-title">Recuperar Palavra-passe</h2>
      {error && <p className="form-error">{error}</p>}
      {message && <p className="form-success">{message}</p>}
      <div className="form">
        <span className="input-span">
          <label className="label">Email</label>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </span>
        <button className="submit" onClick={requestReset} disabled={loading || !email}>
          {loading ? <LoadingDots /> : 'Enviar'}
        </button>
      </div>
    </div>
  );
}

