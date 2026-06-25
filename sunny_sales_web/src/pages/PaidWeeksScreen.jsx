import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import BackHomeButton from '../components/BackHomeButton';
import { FiCalendar, FiFileText, FiCheckCircle, FiCreditCard, FiExternalLink } from 'react-icons/fi';
import './VendorPage.css';

export default function PaidWeeksScreen() {
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!stored) { setLoading(false); return; }
    const vendor = JSON.parse(stored);
    axios.get(`${BASE_URL}/vendors/${vendor.id}/paid-weeks`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => setWeeks(res.data))
      .catch(e => console.error('Erro ao carregar semanas:', e))
      .finally(() => setLoading(false));
  }, []);

  const now = new Date();
  const activeWeeks = weeks.filter(w => new Date(w.end_date) >= now);

  return (
    <div className="vendor-page">
      <BackHomeButton />

      <div className="vendor-hero">
        <FiCreditCard className="vendor-hero-icon" />
        <h1 className="vendor-hero-title">Subscrição</h1>
        <p className="vendor-hero-lead">
          Acompanhe seu histórico de semanas pagas e acesse seus recibos.
        </p>
      </div>

      {weeks.length > 0 && (
        <div className="vendor-cards" style={{ marginBottom: '2rem' }}>
          <div className="vendor-card">
            <div className="vendor-card-icon">
              <FiCheckCircle />
            </div>
            <div className="vendor-card-title">{weeks.length}</div>
            <div className="vendor-card-text">Semanas pagas</div>
          </div>
          <div className="vendor-card">
            <div className="vendor-card-icon">
              <FiCalendar />
            </div>
            <div className="vendor-card-title">{activeWeeks.length}</div>
            <div className="vendor-card-text">Ativas agora</div>
          </div>
          <div className="vendor-card">
            <div className="vendor-card-icon">
              <FiFileText />
            </div>
            <div className="vendor-card-title">{weeks.filter(w => w.receipt_url).length}</div>
            <div className="vendor-card-text">Com recibo</div>
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
          <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Carregando...</p>
        </div>
      )}

      {!loading && weeks.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--text-muted)'
        }}>
          <FiCreditCard size={48} style={{ opacity: 0.5, marginBottom: '12px' }} />
          <p style={{ fontSize: '1rem' }}>Sem semanas pagas registadas.</p>
        </div>
      )}

      {!loading && weeks.length > 0 && (
        <div className="vendor-section">
          <h2 className="vendor-section-title">Histórico de Pagamentos</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {weeks.map((item) => {
              const startDate = new Date(item.start_date);
              const endDate = new Date(item.end_date);
              const isActive = endDate >= now;
              const startStr = startDate.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
              const endStr = endDate.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });

              return (
                <div key={item.id} className="vendor-card" style={{
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
                      <FiCalendar size={20} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text)' }}>
                        {startStr} a {endStr}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Semana de subscrição
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {isActive && (
                      <span className="vendor-badge active" style={{ marginRight: '8px' }}>
                        <span className="vendor-badge-dot" />
                        Ativa
                      </span>
                    )}
                    {item.receipt_url && (
                      <a
                        href={item.receipt_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '36px',
                          height: '36px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--primary-light)',
                          color: 'var(--primary-dark)',
                          transition: 'all var(--transition)',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => { e.target.style.background = 'var(--primary)'; e.target.style.color = 'white'; }}
                        onMouseLeave={(e) => { e.target.style.background = 'var(--primary-light)'; e.target.style.color = 'var(--primary-dark)'; }}
                      >
                        <FiExternalLink size={16} />
                      </a>
                    )}
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
