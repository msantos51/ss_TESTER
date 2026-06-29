import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../config.js';
import '../styles/RoutesScreen.css';

const MapPinIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ClockIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export default function RoutesScreen({ auth, onClose }) {
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="routes-overlay">
      <div className="routes-sheet">
        <div className="routes-header">
          <h2>Trajetos</h2>
          <button className="btn-icon" onClick={onClose} title="Fechar">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {loading ? (
          <div className="routes-loading">
            <span className="loading-dots"><span /><span /><span /></span>
            <p>A carregar trajetos…</p>
          </div>
        ) : routes.length === 0 ? (
          <div className="routes-empty">
            <div className="routes-empty-icon"><MapPinIcon size={40} /></div>
            <h3>Nenhum trajeto registado</h3>
            <p>Quando iniciares a partilha de localização, os trajetos aparecerão aqui.</p>
          </div>
        ) : (
          <div className="routes-list">
            {routes.map((route, idx) => (
              <div key={idx} className="route-item">
                <div className="route-item-icon">
                  <MapPinIcon size={18} />
                </div>
                <div className="route-item-content">
                  <div className="route-item-date">
                    <ClockIcon size={12} />
                    {formatDate(route.start_time || route.created_at)}
                  </div>
                  <div className="route-item-duration">
                    {route.duration && `Duração: ${route.duration}`}
                  </div>
                  {route.distance && (
                    <div className="route-item-distance">
                      Distância: {route.distance}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
