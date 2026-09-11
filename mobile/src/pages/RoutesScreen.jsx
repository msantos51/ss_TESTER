import React, { useState, useEffect, useMemo } from 'react';
import { FiNavigation, FiAlertTriangle } from 'react-icons/fi';
import { BASE_URL } from '../config.js';
import '../styles/RoutesScreen.css';

const DAY_MS = 86400000;

function sameDay(a, b) {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

// "Hoje", "Ontem" ou o dia da semana; para lá de uma semana, a data curta.
function dayLabel(date) {
  const today = new Date();
  if (sameDay(date, today)) return 'Hoje';
  const yesterday = new Date(today.getTime() - DAY_MS);
  if (sameDay(date, yesterday)) return 'Ontem';
  if (today - date < 7 * DAY_MS) {
    const weekday = date.toLocaleDateString('pt-PT', { weekday: 'long' });
    return weekday.charAt(0).toUpperCase() + weekday.slice(1);
  }
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });
}

const timeOf = (date) => date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

function formatDuration(minutes) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${String(minutes % 60).padStart(2, '0')}`;
}

const formatKm = (meters) => `${(meters / 1000).toFixed(1).replace('.', ',')} km`;

export default function RoutesScreen({ auth, onClose }) {
  // Sem `onClose` o ecrã é um separador de página inteira.
  const asTab = typeof onClose !== 'function';
  const { token, vendorId } = auth;
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const response = await fetch(`${BASE_URL}/vendors/${vendorId}/routes`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Não foi possível carregar trajetos');
        const data = await response.json();
        setRoutes(Array.isArray(data) ? data : data.routes || []);
      } catch (err) {
        setError(err.message);
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRoutes();
  }, [vendorId, token]);

  const sessions = useMemo(() => routes.map((route) => {
    const start = route.start_time ? new Date(route.start_time) : null;
    const end = route.end_time ? new Date(route.end_time) : null;
    const minutes = start && end ? Math.max(0, Math.round((end - start) / 60000)) : null;
    return {
      id: route.id,
      start,
      end,
      minutes,
      meters: typeof route.distance_m === 'number' ? route.distance_m : 0,
    };
  }).filter((s) => s.start), [routes]);

  // Resumo dos últimos sete dias.
  const week = useMemo(() => {
    const since = Date.now() - 7 * DAY_MS;
    const recent = sessions.filter((s) => s.start.getTime() >= since);
    return {
      meters: recent.reduce((total, s) => total + s.meters, 0),
      minutes: recent.reduce((total, s) => total + (s.minutes || 0), 0),
    };
  }, [sessions]);

  return (
    <div className={asTab ? 'routes-screen' : 'routes-overlay'}>
      <div className={asTab ? 'routes-panel' : 'routes-sheet'}>
        <div className="screen-head">
          <div className="screen-head-text">
            <h2 className="screen-title">Trajetos</h2>
            <p className="screen-subtitle">Últimas sessões de partilha</p>
          </div>
          {!asTab && (
            <button type="button" className="ss-sheet-close" onClick={onClose} aria-label="Fechar">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        <div className="routes-body">
          {error && (
            <div className="ss-error">
              <FiAlertTriangle size={17} />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <>
              <div className="routes-summary">
                <span className="ss-skeleton routes-summary-skeleton" />
                <span className="ss-skeleton routes-summary-skeleton" />
              </div>
              <div className="routes-list">
                {[0, 1, 2].map((i) => <span key={i} className="ss-skeleton route-skeleton" />)}
              </div>
            </>
          ) : sessions.length === 0 ? (
            !error && (
              <div className="ss-empty">
                <span className="ss-empty-icon"><FiNavigation size={22} /></span>
                <h3>Ainda não há trajetos</h3>
                <p>Assim que ligares a partilha no mapa, cada sessão fica registada aqui.</p>
              </div>
            )
          ) : (
            <>
              <div className="routes-summary">
                <div className="routes-summary-card is-ink">
                  <span className="routes-summary-label">Esta semana</span>
                  <span className="routes-summary-value">{formatKm(week.meters)}</span>
                </div>
                <div className="routes-summary-card">
                  <span className="routes-summary-label">Tempo</span>
                  <span className="routes-summary-value">{formatDuration(week.minutes)}</span>
                </div>
              </div>

              <div className="routes-list">
                {sessions.map((session) => (
                  <div key={session.id} className="route-row">
                    <span className="route-row-icon"><FiNavigation size={18} /></span>
                    <div className="route-row-main">
                      <span className="route-row-day">{dayLabel(session.start)}</span>
                      <span className="route-row-time">
                        {timeOf(session.start)}
                        {session.end ? ` – ${timeOf(session.end)}` : ' · em curso'}
                      </span>
                    </div>
                    <div className="route-row-stats">
                      <span className="route-row-km">{formatKm(session.meters)}</span>
                      {session.minutes !== null && (
                        <span className="route-row-dur">{formatDuration(session.minutes)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
