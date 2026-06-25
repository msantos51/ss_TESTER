import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import BackHomeButton from '../components/BackHomeButton';
import { FiSmartphone } from 'react-icons/fi';
import './VendorPage.css';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSessions = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/vendor-login');
      return;
    }
    try {
      const res = await axios.get(`${BASE_URL}/vendors/me/sessions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSessions(res.data);
    } catch (e) {
      if (e.response && e.response.status === 401) navigate('/vendor-login');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const terminate = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await axios.delete(`${BASE_URL}/vendors/me/sessions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchSessions();
    } catch (e) {
      console.error('Erro ao terminar sessão:', e);
    }
  };

  return (
    <div className="vendor-page">
      <BackHomeButton />

      <div className="vendor-hero">
        <FiSmartphone className="vendor-hero-icon" />
        <h1 className="vendor-hero-title">Sessões Ativas</h1>
        <p className="vendor-hero-lead">
          Gerencie seus dispositivos conectados e termine sessões quando necessário.
        </p>
      </div>

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

      {!loading && sessions.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--text-muted)'
        }}>
          <FiSmartphone size={48} style={{ opacity: 0.5, marginBottom: '12px' }} />
          <p style={{ fontSize: '1rem' }}>Sem sessões ativas.</p>
        </div>
      )}

      {!loading && sessions.length > 0 && (
        <div className="vendor-section">
          <h2 className="vendor-section-title">Meus Dispositivos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {sessions.map((s) => (
              <div key={s.id} className="vendor-card" style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
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
                    <FiSmartphone size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text)' }}>
                      {s.user_agent || 'Dispositivo desconhecido'}
                    </div>
                    {s.current && (
                      <div style={{ fontSize: '0.82rem', color: 'var(--primary)', marginTop: '2px' }}>
                        Sessão atual
                      </div>
                    )}
                  </div>
                </div>
                {s.current ? (
                  <span className="vendor-badge active">
                    <span className="vendor-badge-dot" />
                    Atual
                  </span>
                ) : (
                  <button
                    onClick={() => terminate(s.id)}
                    style={{
                      background: 'transparent',
                      border: '1.5px solid var(--border-strong)',
                      color: '#c62828',
                      borderRadius: 'var(--radius-full)',
                      padding: '6px 16px',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all var(--transition)',
                      minHeight: 'auto'
                    }}
                    onMouseEnter={(e) => { e.target.style.background = 'rgba(239, 68, 68, 0.06)'; e.target.style.borderColor = '#ef5350'; }}
                    onMouseLeave={(e) => { e.target.style.background = 'transparent'; e.target.style.borderColor = 'var(--border-strong)'; }}
                  >
                    Terminar
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
