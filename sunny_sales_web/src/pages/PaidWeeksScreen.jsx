import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import BackHomeButton from '../components/BackHomeButton';
import { FiCalendar, FiFileText, FiCheckCircle, FiCreditCard } from 'react-icons/fi';
import './PaidWeeksScreen.css';

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
    <div className="pw-wrapper">
      <BackHomeButton />
      <div className="pw-container">

        <div className="pw-header">
          <div className="pw-header-icon"><FiCreditCard /></div>
          <div>
            <h1 className="pw-title">Subscrição</h1>
            <p className="pw-subtitle">Histórico de semanas pagas</p>
          </div>
        </div>

        {weeks.length > 0 && (
          <div className="pw-summary">
            <div className="pw-stat">
              <span className="pw-stat-value">{weeks.length}</span>
              <span className="pw-stat-label">Semanas pagas</span>
            </div>
            <div className="pw-stat-divider" />
            <div className="pw-stat">
              <span className="pw-stat-value">{activeWeeks.length}</span>
              <span className="pw-stat-label">Ativas agora</span>
            </div>
            <div className="pw-stat-divider" />
            <div className="pw-stat">
              <span className="pw-stat-value">{weeks.filter(w => w.receipt_url).length}</span>
              <span className="pw-stat-label">Com recibo</span>
            </div>
          </div>
        )}

        {loading && (
          <div className="pw-loading">
            <div className="pw-spinner" />
          </div>
        )}

        {!loading && weeks.length === 0 && (
          <div className="pw-empty">
            <FiCreditCard className="pw-empty-icon" />
            <p>Sem semanas pagas registadas.</p>
          </div>
        )}

        {!loading && weeks.length > 0 && (
          <ul className="pw-list">
            {weeks.map((item) => {
              const startDate = new Date(item.start_date);
              const endDate = new Date(item.end_date);
              const isActive = endDate >= now;
              const startStr = startDate.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });
              const endStr = endDate.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' });

              return (
                <li key={item.id} className="pw-item">
                  <div className="pw-item-icon-wrap">
                    <FiCalendar className="pw-item-icon" />
                  </div>
                  <div className="pw-item-body">
                    <div className="pw-item-top">
                      <span className="pw-item-dates">{startStr} — {endStr}</span>
                      {isActive && (
                        <span className="pw-badge-active">
                          <FiCheckCircle />Ativa
                        </span>
                      )}
                    </div>
                    <span className="pw-item-sub">Semana de subscrição</span>
                  </div>
                  {item.receipt_url && (
                    <a
                      href={item.receipt_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pw-receipt-btn"
                      title="Ver recibo"
                    >
                      <FiFileText />
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        )}

      </div>
    </div>
  );
}
