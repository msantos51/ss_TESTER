import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { registerPlugin } from '@capacitor/core';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BASE_URL, WEB_URL } from '../config.js';
import ProfileScreen from './ProfileScreen.jsx';

const LocationTracker = registerPlugin('LocationTracker');

const vendorIcon = L.divIcon({
  className: '',
  html: '<div class="vendor-location-marker"><div class="vendor-location-pulse"></div><div class="vendor-location-dot"></div></div>',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

function FollowPosition({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom() < 15 ? 16 : map.getZoom());
  }, [position, map]);
  return null;
}

export default function MainScreen({ auth, onLogout, onUserUpdate }) {
  const { token, user, vendorId } = auth;
  const [sharing, setSharing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const listenerRef = useRef(null);
  const watchIdRef = useRef(null);

  const authHeader = { Authorization: `Bearer ${token}` };
  const subscriptionActive = user?.subscription_active;

  useEffect(() => {
    let active = true;
    const startWatch = async () => {
      try {
        const perm = await Geolocation.requestPermissions();
        if (perm.location !== 'granted') {
          if (active) setMapError('Permissão de localização negada. Ativa nas definições do telemóvel.');
          return;
        }
        // Pede já uma posição rápida (baixa precisão) para mostrar o mapa sem
        // esperar pela primeira leitura de GPS de alta precisão, que pode demorar muito.
        try {
          const quickPos = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 5000 });
          if (active && quickPos) {
            setPosition([quickPos.coords.latitude, quickPos.coords.longitude]);
          }
        } catch {
          // ignora; o watchPosition abaixo continua a tentar
        }
        watchIdRef.current = await Geolocation.watchPosition(
          { enableHighAccuracy: true },
          (pos, err) => {
            if (!active) return;
            if (err) {
              setMapError('Não foi possível obter a localização.');
              return;
            }
            if (pos) {
              setMapError(null);
              setPosition([pos.coords.latitude, pos.coords.longitude]);
            }
          }
        );
      } catch {
        if (active) setMapError('Não foi possível obter a localização.');
      }
    };
    startWatch();
    return () => {
      active = false;
      if (watchIdRef.current != null) Geolocation.clearWatch({ id: watchIdRef.current });
    };
  }, []);

  const sendLocation = useCallback(async (lat, lng) => {
    try {
      setPosition([lat, lng]);
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
        setError('Permissão de localização negada.');
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

      listenerRef.current = await LocationTracker.addListener('locationUpdate', ({ lat, lng }) => {
        sendLocation(lat, lng);
      });
      await LocationTracker.startTracking();
      setSharing(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stopSharing = async () => {
    setLoading(true);
    setError(null);
    try {
      if (listenerRef.current) {
        await listenerRef.current.remove();
        listenerRef.current = null;
      }
      await LocationTracker.stopTracking();
    } catch (err) {
      console.error('Erro ao parar tracking nativo:', err);
    }
    try {
      await fetch(`${BASE_URL}/vendors/${vendorId}/routes/stop`, {
        method: 'POST',
        headers: authHeader,
      });
    } catch (err) {
      console.error('Erro ao parar partilha:', err);
    } finally {
      setSharing(false);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (sharing) await stopSharing();
    try {
      await fetch(`${BASE_URL}/logout`, { method: 'POST', headers: authHeader });
    } catch {}
    onLogout();
  };

  const openWebsite = () => {
    window.open(`${WEB_URL}/#/dashboard`, '_system');
  };

  useEffect(() => {
    return () => {
      if (listenerRef.current) listenerRef.current.remove();
    };
  }, []);

  const vendorName = user?.name || 'Vendedor';

  return (
    <div className="main-screen">
      {/* Map background */}
      <div className="main-map-area">
        {mapError && <div className="alert alert-warning map-overlay-alert">{mapError}</div>}
        {position ? (
          <MapContainer center={position} zoom={16} className="map-container" zoomControl={false}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
              attribution="&copy; <a href='https://openstreetmap.org'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
              subdomains="abcd"
            />
            <Marker position={position} icon={vendorIcon} />
            <FollowPosition position={position} />
          </MapContainer>
        ) : (
          !mapError && (
            <div className="map-loading">
              <span className="loading-dots"><span /><span /><span /></span>
              <p>A obter a tua localização…</p>
            </div>
          )
        )}
      </div>

      {/* Top bar */}
      <div className="main-top-bar">
        <button className="vendor-info vendor-info-btn" onClick={() => setShowProfile(true)} title="Editar perfil">
          <div className="vendor-avatar" style={{ borderColor: user?.pin_color }}>
            {vendorName.charAt(0).toUpperCase()}
          </div>
          <span className="vendor-name">{vendorName}</span>
        </button>
        <button className="btn-icon logout-btn" onClick={handleLogout} title="Sair">
          <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>

      {showProfile && (
        <ProfileScreen auth={auth} onClose={() => setShowProfile(false)} onUserUpdate={onUserUpdate} />
      )}

      {/* Bottom overlay controls */}
      <div className="main-bottom-controls">
        {!subscriptionActive && (
          <div className="alert alert-warning">
            <strong>Subscrição inativa.</strong> Renova no site para partilhar localização.
          </div>
        )}

        {error && <div className="error-msg">{error}</div>}

        {sharing && (
          <div className="sharing-indicator">
            <div className="status-dot active" />
            <span>A partilhar localização</span>
          </div>
        )}

        <button
          className={`btn location-toggle-btn ${sharing ? 'btn-danger' : 'btn-primary'}`}
          onClick={sharing ? stopSharing : startSharing}
          disabled={loading || !subscriptionActive}
        >
          {loading ? (
            <span className="loading-dots"><span /><span /><span /></span>
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

        <button className="btn btn-website" onClick={openWebsite}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          Aceder ao site
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="7" y1="17" x2="17" y2="7" />
            <polyline points="7 7 17 7 17 17" />
          </svg>
        </button>
      </div>
    </div>
  );
}
