import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { BASE_URL, WEB_URL } from '../config.js';

const LOCATION_INTERVAL_MS = 5000;

export default function Dashboard({ auth, onLogout }) {
  const { token, user, vendorId } = auth;
  const [sharing, setSharing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('');
  const [coords, setCoords] = useState(null);
  const intervalRef = useRef(null);

  const authHeader = { Authorization: `Bearer ${token}` };

  const sendLocation = useCallback(async () => {
    try {
      const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      const { latitude: lat, longitude: lng } = pos.coords;
      setCoords({ lat, lng });
      await fetch(`${BASE_URL}/vendors/${vendorId}/location`, {
        method: 'PUT',
        headers: { ...authHeader, 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng }),
      });
    } catch (err) {
      console.error('Erro ao enviar localização:', err);
    }
  }, [vendorId, token]);

  const startSharing = async () => {
    setLoading(true);
    setError(null);
    try {
      const perm = await Geolocation.requestPermissions();
      if (perm.location !== 'granted') {
        setError('Permissão de localização negada. Ativa nas definições do telemóvel.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${BASE_URL}/vendors/${vendorId}/routes/start`, {
        method: 'POST',
        headers: authHeader,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Erro ao iniciar partilha');
      }

      setSharing(true);
      setStatus('A partilhar localização…');
      await sendLocation();
      intervalRef.current = setInterval(sendLocation, LOCATION_INTERVAL_MS);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stopSharing = async () => {
    setLoading(true);
    setError(null);
    clearInterval(intervalRef.current);
    intervalRef.current = null;
    try {
      await fetch(`${BASE_URL}/vendors/${vendorId}/routes/stop`, {
        method: 'POST',
        headers: authHeader,
      });
    } catch (err) {
      console.error('Erro ao parar partilha:', err);
    } finally {
      setSharing(false);
      setCoords(null);
      setStatus('');
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (sharing) await stopSharing();
    try {
      await fetch(`${BASE_URL}/logout`, { method: 'POST', headers: authHeader });
    } catch {
      // ignore
    }
    onLogout();
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  const openWebsite = () => {
    const url = `${WEB_URL}/#/dashboard`;
    window.open(url, '_system');
  };

  const vendorName = user?.name || 'Vendedor';
  const product = user?.product || '';
  const subscriptionActive = user?.subscription_active;

  return (
    <div className="screen dashboard-screen">
      <header className="dashboard-header">
        <div className="header-top">
          <div className="vendor-info">
            <div className="vendor-avatar">
              {vendorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="vendor-name">{vendorName}</div>
              {product && <div className="vendor-product">{product}</div>}
            </div>
          </div>
          <button className="btn-icon logout-btn" onClick={handleLogout} title="Sair">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </header>

      <main className="dashboard-main">
        {!subscriptionActive && (
          <div className="alert alert-warning">
            <strong>Subscrição inativa.</strong> Renova no site para ativar a partilha de localização.
          </div>
        )}

        <div className={`location-card ${sharing ? 'sharing' : ''}`}>
          <div className="location-status">
            <div className={`status-dot ${sharing ? 'active' : 'inactive'}`} />
            <span className="status-label">
              {sharing ? 'Localização ativa' : 'Localização inativa'}
            </span>
          </div>

          {coords && sharing && (
            <div className="coords-display">
              <span>{coords.lat.toFixed(6)}°N</span>
              <span>{coords.lng.toFixed(6)}°E</span>
            </div>
          )}

          {error && <div className="error-msg">{error}</div>}

          <button
            className={`btn location-toggle-btn ${sharing ? 'btn-danger' : 'btn-primary'}`}
            onClick={sharing ? stopSharing : startSharing}
            disabled={loading || !subscriptionActive}
          >
            {loading ? (
              <span className="loading-dots">
                <span /><span /><span />
              </span>
            ) : sharing ? (
              <>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                  <rect x="6" y="6" width="12" height="12" rx="1" />
                </svg>
                Parar partilha
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <circle cx="12" cy="12" r="8" strokeDasharray="2 2" />
                  <line x1="12" y1="2" x2="12" y2="5" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                  <line x1="2" y1="12" x2="5" y2="12" />
                  <line x1="19" y1="12" x2="22" y2="12" />
                </svg>
                Iniciar partilha
              </>
            )}
          </button>

          {sharing && (
            <p className="sharing-note">
              A tua localização é atualizada a cada {LOCATION_INTERVAL_MS / 1000} segundos.
            </p>
          )}
        </div>

        <div className="website-card">
          <div className="website-card-content">
            <div className="website-card-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <div>
              <div className="website-card-title">Aceder ao site</div>
              <div className="website-card-desc">Edita o perfil, consulta estatísticas e faturas</div>
            </div>
          </div>
          <button className="btn btn-outline" onClick={openWebsite}>
            Abrir
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="7" y1="17" x2="17" y2="7" />
              <polyline points="7 7 17 7 17 17" />
            </svg>
          </button>
        </div>
      </main>
    </div>
  );
}
