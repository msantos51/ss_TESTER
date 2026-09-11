import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { registerPlugin } from '@capacitor/core';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BASE_URL, TILE_LAYER, mediaUrl } from '../config.js';
import { terminateCurrentSession } from '../sessionApi.js';
import AnimatedMarker from '../components/AnimatedMarker.jsx';
import useDeviceHeading from '../hooks/useDeviceHeading.js';
import PlansScreen from './PlansScreen.jsx';

const LocationTracker = registerPlugin('LocationTracker');

const DEFAULT_PIN = '#EE9B00';

function hexToRgba(hex, alpha) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  if (!match) return `rgba(238, 155, 0, ${alpha})`;
  const [r, g, b] = match.slice(1).map((h) => parseInt(h, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// (em português) Distância entre duas coordenadas, em metros. É o que
// alimenta a métrica "Distância" enquanto o vendedor está a partilhar.
function metersBetween([lat1, lng1], [lat2, lng2]) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function formatElapsed(totalSeconds) {
  const secs = Math.max(0, Math.floor(totalSeconds));
  const pad = (n) => String(n).padStart(2, '0');
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(secs % 60)}`;
  return `${pad(minutes)}:${pad(secs % 60)}`;
}

function formatKm(meters) {
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

// O pin do vendedor: círculo na cor escolhida no perfil, com uma vela
// branca dentro. O anel só pulsa enquanto a partilha está ligada.
function getVendorLocationHtml(heading, color, sharing) {
  const hasHeading = heading !== null && !isNaN(heading);
  const sail = `<svg viewBox="0 0 20 20" width="11" height="11" style="display:block;${hasHeading ? `transform:rotate(${heading}deg);` : ''}"><polygon points="10,1 6.5,14 10,11.5 13.5,14" fill="#fff"/></svg>`;
  const pinColor = color || DEFAULT_PIN;
  const pulse = sharing
    ? `<div class="vendor-location-pulse" style="background:${hexToRgba(pinColor, 0.3)};"></div>`
    : '';
  return `<div class="vendor-location-marker">${pulse}<div class="vendor-location-dot" style="background:${pinColor};">${sail}</div></div>`;
}

function FollowPosition({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom() < 15 ? 16 : map.getZoom());
  }, [position, map]);
  return null;
}

// Em browser o Capacitor não implementa `requestPermissions`; nesse caso é o
// próprio pedido de posição que trata da permissão.
async function ensureLocationPermission() {
  try {
    const perm = await Geolocation.requestPermissions();
    return perm.location === 'granted' || perm.location === 'prompt';
  } catch {
    return true;
  }
}

export default function MapTab({ auth, onChangePage, onLogout, onUserUpdate, registerStopSharing }) {
  const { token, user, vendorId } = auth;
  const [sharing, setSharing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [showPlans, setShowPlans] = useState(false);
  const [startedAt, setStartedAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [distanceM, setDistanceM] = useState(0);
  const listenerRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastTrackedRef = useRef(null);
  const { heading, reportGpsHeading } = useDeviceHeading();
  const pinColor = user?.pin_color || DEFAULT_PIN;
  const vendorIcon = useMemo(() => L.divIcon({
    className: '',
    html: getVendorLocationHtml(heading, pinColor, sharing),
    iconSize: [56, 56],
    iconAnchor: [28, 28],
  }), [heading, pinColor, sharing]);

  const authHeader = { Authorization: `Bearer ${token}` };
  const subscriptionActive = user?.subscription_active;

  useEffect(() => {
    let active = true;
    const startWatch = async () => {
      try {
        if (!(await ensureLocationPermission())) {
          if (active) setMapError('Permissão de localização negada. Ativa nas definições do telemóvel.');
          return;
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
              reportGpsHeading(pos.coords.heading, pos.coords.speed);
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

  // O tempo decorrido vem do instante em que a sessão começou, não de um
  // contador local: assim sobrevive a app ir para segundo plano.
  useEffect(() => {
    if (!sharing || !startedAt) return undefined;
    const tick = () => setElapsed((Date.now() - startedAt) / 1000);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sharing, startedAt]);

  const readApiError = async (response, fallbackMessage) => {
    try {
      const payload = await response.json();
      return payload.detail || fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  const sendLocation = useCallback(async (lat, lng) => {
    setPosition([lat, lng]);
    // Distância acumulada do trajeto GPS desta sessão de partilha.
    const previous = lastTrackedRef.current;
    if (previous) {
      const step = metersBetween(previous, [lat, lng]);
      if (step > 1) setDistanceM((total) => total + step);
    }
    lastTrackedRef.current = [lat, lng];

    const response = await fetch(`${BASE_URL}/vendors/${vendorId}/location`, {
      method: 'PUT',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng }),
    });

    if (!response.ok) {
      const message = await readApiError(response, 'Erro ao enviar localização');
      throw new Error(message);
    }
  }, [vendorId, token]);

  const startSharing = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!(await ensureLocationPermission())) {
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
      const route = await res.json().catch(() => null);
      const startTime = route?.start_time ? new Date(route.start_time).getTime() : Date.now();

      const currentPosition = position || await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      const currentLat = Array.isArray(currentPosition)
        ? currentPosition[0]
        : currentPosition.coords.latitude;
      const currentLng = Array.isArray(currentPosition)
        ? currentPosition[1]
        : currentPosition.coords.longitude;

      lastTrackedRef.current = null;
      setDistanceM(0);
      setStartedAt(Number.isNaN(startTime) ? Date.now() : startTime);
      setElapsed(0);

      await sendLocation(currentLat, currentLng);

      listenerRef.current = await LocationTracker.addListener('locationUpdate', async ({ lat, lng }) => {
        try {
          await sendLocation(lat, lng);
        } catch (err) {
          console.error('Erro ao enviar localização:', err);
          setError(err.message);
        }
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
      setStartedAt(null);
      setElapsed(0);
      setDistanceM(0);
      lastTrackedRef.current = null;
      setLoading(false);
    }
  };

  // A app deixou de ter o botão de sair no mapa (passou para a Conta), por
  // isso é o App que precisa de conseguir parar a partilha antes de limpar
  // a sessão.
  const sharingRef = useRef(false);
  const stopSharingRef = useRef(stopSharing);
  sharingRef.current = sharing;
  stopSharingRef.current = stopSharing;

  useEffect(() => {
    if (!registerStopSharing) return undefined;
    registerStopSharing(async () => {
      if (sharingRef.current) await stopSharingRef.current();
    });
    return () => registerStopSharing(null);
  }, [registerStopSharing]);

  useEffect(() => {
    return () => {
      if (listenerRef.current) listenerRef.current.remove();
    };
  }, []);

  const vendorName = user?.name || 'Vendedor';
  const initial = vendorName.charAt(0).toUpperCase();
  const photo = user?.profile_photo ? mediaUrl(user.profile_photo) : null;

  const status = sharing
    ? { label: 'A partilhar', className: 'is-sharing' }
    : { label: subscriptionActive ? 'Offline' : 'Inativo', className: 'is-idle' };

  return (
    <div className="map-screen">
      {/* O mapa ocupa todo o fundo; o resto é sobreposto. */}
      <div className="map-canvas">
        {position ? (
          <MapContainer center={position} zoom={16} className="map-container" zoomControl={false}>
            <TileLayer {...TILE_LAYER} />
            <AnimatedMarker position={position} icon={vendorIcon} />
            <FollowPosition position={position} />
          </MapContainer>
        ) : (
          <div className="map-placeholder" aria-hidden="true" />
        )}
      </div>

      <div className="map-chrome">
        <div className="map-topbar">
          <button
            type="button"
            className="map-user-pill"
            onClick={() => onChangePage('account')}
            title="Ir para a conta"
          >
            {photo ? (
              <img src={photo} alt="" className="map-user-avatar" />
            ) : (
              <span className="map-user-avatar map-user-avatar-initial">{initial}</span>
            )}
            <span className="map-user-name">{vendorName}</span>
          </button>

          <div className={`map-status-pill ${status.className}`}>
            <span className="map-status-dot" />
            <span className="map-status-label">{status.label}</span>
          </div>
        </div>

        <div className="map-bottom">
          {/* GPS ainda por obter: skeleton com a forma do cartão. */}
          {!position && !mapError && (
            <div className="map-gps-skeleton">
              <span className="ss-skeleton ss-skeleton-line map-gps-skeleton-line" />
              <span className="map-gps-skeleton-text">A obter a tua localização…</span>
            </div>
          )}

          {mapError && (
            <div className="ss-error map-alert">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>{mapError}</span>
            </div>
          )}

          {error && (
            <div className="ss-error map-alert">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          {!subscriptionActive && (
            <div className="map-sub-banner">
              <span className="map-sub-icon">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <div className="map-sub-text">
                <span className="map-sub-title">Subscrição inativa</span>
                <span className="map-sub-desc">Ativa um plano para apareceres no mapa.</span>
              </div>
              <button type="button" className="map-sub-btn" onClick={() => setShowPlans(true)}>
                Ativar
              </button>
            </div>
          )}

          <div className="share-card">
            {sharing && (
              <div className="share-metrics">
                <div className="share-metric">
                  <span className="share-metric-label">Tempo</span>
                  <span className="share-metric-value">{formatElapsed(elapsed)}</span>
                </div>
                <div className="share-metric">
                  <span className="share-metric-label">Distância</span>
                  <span className="share-metric-value">{formatKm(distanceM)}</span>
                </div>
              </div>
            )}

            <button
              type="button"
              className={`share-btn${sharing ? ' is-sharing' : ''}`}
              onClick={sharing ? stopSharing : startSharing}
              disabled={loading || !subscriptionActive}
            >
              <span className="share-btn-dot" />
              {loading
                ? (sharing ? 'A parar…' : 'A ligar…')
                : (sharing ? 'Parar partilha' : 'Iniciar partilha')}
            </button>
          </div>
        </div>
      </div>

      {showPlans && <PlansScreen auth={auth} onClose={() => setShowPlans(false)} />}
    </div>
  );
}
