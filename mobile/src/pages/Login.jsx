import React, { useState } from 'react';
import { BASE_URL } from '../config.js';

function getVendorIdFromToken(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub;
  } catch {
    return null;
  }
}

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [forceConfirm, setForceConfirm] = useState(false);

  const attemptLogin = async (force = false) => {
    const tokenRes = await fetch(`${BASE_URL}/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, ...(force && { force: true }) }),
    });
    if (!tokenRes.ok) {
      const err = await tokenRes.json();
      const status = tokenRes.status;
      if (status === 409) {
        setForceConfirm(true);
        throw Object.assign(new Error('conflict'), { status: 409 });
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
    setForceConfirm(false);
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

  return (
    <div className="screen login-screen">
      <div className="login-header">
        <div className="logo-circle">
          <svg viewBox="0 0 64 64" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="32" fill="white" fillOpacity="0.15" />
            <path d="M32 16 L20 40 L32 34 L44 40 Z" fill="white" />
          </svg>
        </div>
        <h1 className="app-title">Sunny Sales</h1>
        <p className="app-subtitle">Área do Vendedor</p>
      </div>

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="o-teu@email.com"
            autoComplete="email"
            disabled={loading}
          />
        </div>
        <div className="input-group">
          <label>Palavra-passe</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={loading}
          />
        </div>

        {error && <div className="error-msg">{error}</div>}

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
      </form>
    </div>
  );
}
