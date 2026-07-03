import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../config';
import { FiMap, FiNavigation, FiClock, FiCalendar, FiChevronRight } from 'react-icons/fi';
import './RoutesScreen.css';

export default function RoutesScreen() {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!stored) { setLoading(false); return; }
    const vendor = JSON.parse(stored);
    axios.get(`${BASE_URL}/vendors/${vendor.id}/routes`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => setRoutes(res.data))
      .catch(e => console.error('Erro ao carregar trajetos:', e))
      .finally(() => setLoading(false));
  }, []);

  const validRoutes = routes.filter(r => (r.distance_m / 1000).toFixed(2) !== '0.00');
  const totalKm = validRoutes.reduce((s, r) => s + r.distance_m, 0) / 1000;
  const totalMin = validRoutes.reduce((s, r) => {
    if (!r.end_time) return s;
    return s + Math.round((new Date(r.end_time) - new Date(r.start_time)) / 60000);
  }, 0);

  return (
    <div className="rs-wrapper">
      <div className="rs-container">

        <div className="rs-header">
          <div className="rs-header-icon"><FiMap /></div>
          <div>
            <h1 className="rs-title">Histórico de Trajetos</h1>
            <p className="rs-subtitle">Os teus percursos registados</p>
          </div>
        </div>

        {validRoutes.length > 0 && (
          <div className="rs-summary">
            <div className="rs-stat">
              <span className="rs-stat-value">{validRoutes.length}</span>
              <span className="rs-stat-label">Trajetos</span>
            </div>
            <div className="rs-stat-divider" />
            <div className="rs-stat">
              <span className="rs-stat-value">{totalKm.toFixed(1)}<span className="rs-stat-unit"> km</span></span>
              <span className="rs-stat-label">Distância total</span>
            </div>
            <div className="rs-stat-divider" />
            <div className="rs-stat">
              <span className="rs-stat-value">{totalMin}<span className="rs-stat-unit"> min</span></span>
              <span className="rs-stat-label">Tempo total</span>
            </div>
          </div>
        )}

        {loading && (
          <div className="rs-loading">
            <div className="rs-spinner" />
          </div>
        )}

        {!loading && validRoutes.length === 0 && (
          <div className="rs-empty">
            <FiMap className="rs-empty-icon" />
            <p>Sem trajetos registados.</p>
          </div>
        )}

        {!loading && validRoutes.length > 0 && (
          <ul className="rs-list">
            {validRoutes.map((route) => {
              const start = new Date(route.start_time);
              const end = route.end_time ? new Date(route.end_time) : null;
              const durationMin = end ? Math.round((end - start) / 60000) : 0;
              const km = (route.distance_m / 1000).toFixed(2);
              const dateStr = start.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
              const timeStr = start.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

              return (
                <li
                  key={route.id}
                  className="rs-item"
                  onClick={() => navigate('/route-detail', { state: { route } })}
                >
                  <div className="rs-item-icon-wrap">
                    <FiNavigation className="rs-item-icon" />
                  </div>
                  <div className="rs-item-body">
                    <span className="rs-item-date">{dateStr}</span>
                    <div className="rs-item-meta">
                      <span className="rs-item-meta-tag"><FiClock />{durationMin} min</span>
                      <span className="rs-item-meta-tag"><FiNavigation />{km} km</span>
                      <span className="rs-item-meta-tag"><FiCalendar />{timeStr}</span>
                    </div>
                  </div>
                  <FiChevronRight className="rs-item-chevron" />
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
