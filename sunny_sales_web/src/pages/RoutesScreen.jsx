import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../config';
import BackHomeButton from '../components/BackHomeButton';
import { FiMap, FiNavigation, FiClock, FiCalendar } from 'react-icons/fi';
import './VendorPage.css';

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
    <div className="vendor-page">
      <BackHomeButton />

      <div className="vendor-hero">
        <FiMap className="vendor-hero-icon" />
        <h1 className="vendor-hero-title">Histórico de Trajetos</h1>
        <p className="vendor-hero-lead">
          Acompanhe seus percursos e estatísticas de movimento.
        </p>
      </div>

      {validRoutes.length > 0 && (
        <div className="vendor-cards" style={{ marginBottom: '2rem' }}>
          <div className="vendor-card">
            <div className="vendor-card-icon">
              <FiNavigation />
            </div>
            <div className="vendor-card-title">{validRoutes.length}</div>
            <div className="vendor-card-text">Trajetos</div>
          </div>
          <div className="vendor-card">
            <div className="vendor-card-icon">
              <FiMap />
            </div>
            <div className="vendor-card-title">{totalKm.toFixed(1)} km</div>
            <div className="vendor-card-text">Distância total</div>
          </div>
          <div className="vendor-card">
            <div className="vendor-card-icon">
              <FiClock />
            </div>
            <div className="vendor-card-title">{totalMin} min</div>
            <div className="vendor-card-text">Tempo total</div>
          </div>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border)',
            borderTop: '3px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto'
          }} />
        </div>
      )}

      {!loading && validRoutes.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--text-muted)'
        }}>
          <FiMap size={48} style={{ opacity: 0.5, marginBottom: '12px' }} />
          <p style={{ fontSize: '1rem' }}>Sem trajetos registados.</p>
        </div>
      )}

      {!loading && validRoutes.length > 0 && (
        <div className="vendor-section">
          <h2 className="vendor-section-title">Meus Trajetos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {validRoutes.map((route) => {
              const start = new Date(route.start_time);
              const end = route.end_time ? new Date(route.end_time) : null;
              const durationMin = end ? Math.round((end - start) / 60000) : 0;
              const km = (route.distance_m / 1000).toFixed(2);
              const dateStr = start.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
              const timeStr = start.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={route.id}
                  className="vendor-card"
                  onClick={() => navigate('/route-detail', { state: { route } })}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px 20px',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{
                    width: '44px',
                    height: '44px',
                    background: 'var(--primary-light)',
                    borderRadius: 'var(--radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-dark)',
                    flexShrink: 0
                  }}>
                    <FiNavigation size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text)' }}>
                      {dateStr}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', gap: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiClock size={14} /> {durationMin} min
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiMap size={14} /> {km} km
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FiCalendar size={14} /> {timeStr}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
