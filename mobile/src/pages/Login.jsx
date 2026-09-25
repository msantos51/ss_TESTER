import React, { useState } from 'react';
import { FiArrowLeft } from 'react-icons/fi';
import { BASE_URL } from '../config.js';

function getVendorIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  } catch {
    return null;
  }
}

export default function Login({ onLogin, onBack, onRegister, initialEmail = '' }) {
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forceConfirm, setForceConfirm] = useState(false);
  // Conta criada mas email por confirmar: oferecemos reenviar a confirmação.
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);
  const [resending, setResending] = useState(false);
  const [info, setInfo] = useState('');

  const attemptLogin = async (force = false) => {
    const tokenRes = await fetch(`${BASE_URL}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, ...(force && { force: true }) }),
    });
    if (!tokenRes.ok) {
      // Um erro do proxy (502 em HTML) não traz JSON: não pode rebentar aqui.
      const err = await tokenRes.json().catch(() => ({}));
      const status = tokenRes.status;
      if (status === 409) {
        setForceConfirm(true);
        throw Object.assign(new Error('conflict'), { status: 409 });
      }
      if (status === 403) {
        setNeedsEmailConfirm(true);
        throw new Error('Confirma o teu email antes de iniciar sessão.');
      }
      throw new Error(err.detail || 'Falha no login');
    }
    const { access_token: token } = await tokenRes.json();
    const vendorId = getVendorIdFromToken(token);

    const userRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!userRes.ok) throw new Error('Falha ao obter dados do vendedor');
    const user = await userRes.json();

    return { token, user, vendorId };
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError(null);
    setInfo('');
    setForceConfirm(false);
    setNeedsEmailConfirm(false);
    try {
      const result = await attemptLogin(false);
      onLogin(result);
    } catch (err) {
      if (err.status !== 409) setError(err.message || 'Falha no login');
    } finally {
      setLoading(false);
    }
  };

  const handleForceLogin = async () => {
    setLoading(true);
    setError(null);
    setForceConfirm(false);
    try {
      const result = await attemptLogin(true);
      onLogin(result);
    } catch (err) {
      setError(err.message || 'Falha no login');
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    setResending(true);
    setError(null);
    setInfo('');
    try {
      const res = await fetch(`${BASE_URL}/vendors/resend-confirmation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.detail || 'Não foi possível reenviar o email.');
      setInfo(payload?.detail || 'Email de confirmação reenviado.');
    } catch (err) {
      setError(err.message);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="screen login-screen">
      {onBack && (
        <div className="auth-topbar auth-topbar-floating">
          <button type="button" className="btn-icon auth-back" onClick={onBack} title="Voltar" aria-label="Voltar">
            <FiArrowLeft />
          </button>
        </div>
      )}

      <div className="login-header">
        <div className="logo-circle">
          {/* alt vazio: o título "Sunny Sales" logo abaixo já nomeia o ecrã. */}
          <img src="/logo-icon.png" alt="" className="logo-circle-img" />
        </div>
        <h1 className="app-title">Sunny Sales</h1>
        <p className="app-subtitle">App do Vendedor</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="login-email">Email</label>
          <input
            id="login-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="o-teu@email.com"
            autoComplete="email"
            disabled={loading}
          />
        </div>
        <div className="input-group">
          <label htmlFor="login-password">Palavra-passe</label>
          <input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={loading}
          />
        </div>

        {error && <div className="error-msg" role="alert">{error}</div>}
        {info && <div className="info-msg" role="status">{info}</div>}

        {needsEmailConfirm && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleResendConfirmation}
            disabled={resending || !email}
          >
            {resending ? 'A reenviar…' : 'Reenviar email de confirmação'}
          </button>
        )}

        {forceConfirm ? (
          <div className="force-confirm">
            <p>Existe uma sessão ativa noutro dispositivo.</p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleForceLogin}
              disabled={loading}
            >
              {loading ? 'A entrar…' : 'Terminar sessão anterior e entrar'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setForceConfirm(false)}
              disabled={loading}
            >
              Cancelar
            </button>
          </div>
        ) : (
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'A entrar…' : 'Entrar'}
          </button>
        )}

        {onRegister && (
          <button type="button" className="auth-link" onClick={onRegister}>
            Ainda não tens conta? <strong>Regista-te</strong>
          </button>
        )}
      </form>
    </div>
  );
}
