import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import BackHomeButton from '../components/BackHomeButton';
import { FiFileText, FiExternalLink } from 'react-icons/fi';
import './VendorPage.css';

export default function Invoices() {
  const [weeks, setWeeks] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadWeeks = async () => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!stored) { setLoading(false); return; }
    const vendor = JSON.parse(stored);
    try {
      const res = await axios.get(`${BASE_URL}/vendors/${vendor.id}/paid-weeks`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setWeeks(res.data);
    } catch (e) {
      console.error('Erro ao carregar semanas:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWeeks();
  }, []);

  return (
    <div className="vendor-page">
      <BackHomeButton />

      <div className="vendor-hero">
        <FiFileText className="vendor-hero-icon" />
        <h1 className="vendor-hero-title">Faturas</h1>
        <p className="vendor-hero-lead">
          Acesse e baixe suas faturas de pagamento.
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

      {!loading && weeks.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--text-muted)'
        }}>
          <FiFileText size={48} style={{ opacity: 0.5, marginBottom: '12px' }} />
          <p style={{ fontSize: '1rem' }}>Sem faturas disponíveis.</p>
        </div>
      )}

      {!loading && weeks.length > 0 && (
        <div className="vendor-section">
          <h2 className="vendor-section-title">Minhas Faturas</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {weeks.map((item) => {
              const start = new Date(item.start_date).toLocaleDateString('pt-PT');
              const end = new Date(item.end_date).toLocaleDateString('pt-PT');
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
                      <FiFileText size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: '600', color: 'var(--text)' }}>
                        {start} a {end}
                      </div>
                    </div>
                  </div>
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
              );
            })}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
