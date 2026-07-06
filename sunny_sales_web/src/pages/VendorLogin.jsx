// (em português) Página Web para login de vendedores
import './VendorLogin.css';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser } from 'react-icons/fi';
import axios from 'axios';
import { BASE_URL } from '../config';
import { SESSION_ENDED_MESSAGE_KEY } from '../sessionAuth';
import LoadingDots from '../components/LoadingDots';

// Componente de login dedicado aos vendedores
export default function VendorLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Mostra, uma única vez, o aviso deixado pelo interceptor de sessão
  // (ex: sessão terminada por login noutro dispositivo ou token expirado).
  useEffect(() => {
    const sessionMessage = sessionStorage.getItem(SESSION_ENDED_MESSAGE_KEY);
    if (sessionMessage) {
      setError(sessionMessage);
      sessionStorage.removeItem(SESSION_ENDED_MESSAGE_KEY);
    }
  }, []);

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
      <div className="form login-form auth-form">
        <div className="auth-head">
          <span className="auth-head-icon"><FiUser /></span>
          <h2 className="title auth-title">Login de Vendedor</h2>
          <p className="auth-head-sub">
            Acede ao teu painel para gerires a tua presença no mapa.
          </p>
        </div>

        {error && <p className="form-error">{error}</p>}

        <span className="input-span">
          <label className="label" htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            placeholder="email@exemplo.pt"
            autoComplete="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
          />
        </span>
        <span className="input-span">
          <label className="label" htmlFor="login-password">Palavra-passe</label>
          <input
            id="login-password"
            type="password"
            placeholder="A tua palavra-passe"
            autoComplete="current-password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
          />
        </span>

        <p className="vl-forgot-row">
          <span
            className="sign-up-link"
            onClick={() => navigate('/forgot-password')}
          >
            Esqueci a palavra-passe
          </span>
        </p>

        <button
          className="submit"
          onClick={login}
          disabled={!email || !password || loading}
        >
          {loading ? <LoadingDots /> : 'Entrar'}
        </button>

        <div className="auth-divider"><span>ainda não tens conta?</span></div>

        <button
          type="button"
          className="auth-secondary-btn"
          onClick={() => navigate('/vendor-register')}
        >
          Criar conta de vendedor
        </button>
      </div>
    </div>
  );
}

