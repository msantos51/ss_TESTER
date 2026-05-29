import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import BackHomeButton from '../components/BackHomeButton';

export default function PaidWeeksScreen() {
  const [weeks, setWeeks] = useState([]);

  const loadWeeks = async () => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!stored) return;
    const vendor = JSON.parse(stored);
    try {
      const res = await axios.get(`${BASE_URL}/vendors/${vendor.id}/paid-weeks`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setWeeks(res.data);
    } catch (e) {
      console.error('Erro ao carregar semanas:', e);
    }
  };

  useEffect(() => {
    loadWeeks();
  }, []);

  return (
    <div className="page-wrapper">
      <BackHomeButton />
      <h2>Semanas Pagas</h2>
      {weeks.length === 0 && (
        <p className="page-empty">Sem semanas pagas registadas.</p>
      )}
      <ul className="page-list">
        {weeks.map((item) => {
          const start = new Date(item.start_date).toLocaleDateString('pt-PT');
          const end = new Date(item.end_date).toLocaleDateString('pt-PT');
          return (
            <li key={item.id} className="page-list-item" style={{ cursor: 'default' }}>
              <span className="page-list-item-title">{start} — {end}</span>
              {item.receipt_url && (
                <a
                  href={item.receipt_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="page-link-btn"
                >
                  Recibo
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
