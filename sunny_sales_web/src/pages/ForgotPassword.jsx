// (em português) Página para recuperação de palavra-passe
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiKey, FiArrowLeft } from 'react-icons/fi';
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
  const navigate = useNavigate();

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
      <div className="form auth-form">
        <div className="auth-head">
          <span className="auth-head-icon"><FiKey /></span>
          <h2 className="title auth-title">Recuperar Palavra-passe</h2>
          <p className="auth-head-sub">
            Indica o email da tua conta e enviamos-te um link para definires
            uma nova palavra-passe.
          </p>
        </div>

        {error && <p className="form-error">{error}</p>}
        {message && <p className="form-success">{message}</p>}

        <span className="input-span">
          <label className="label" htmlFor="forgot-email">Email</label>
          <input
            id="forgot-email"
            type="email"
            placeholder="email@exemplo.pt"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </span>
        <button className="submit" onClick={requestReset} disabled={loading || !email}>
          {loading ? <LoadingDots /> : 'Enviar link de recuperação'}
        </button>

        <p className="auth-footer-row">
          <span className="sign-up-link" onClick={() => navigate('/vendor-login')}>
            <FiArrowLeft size={12} style={{ verticalAlign: '-1px', marginRight: 4 }} />
            Voltar ao login
          </span>
        </p>
      </div>
    </div>
  );
}

