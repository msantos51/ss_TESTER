// (em português) Página de definições de conta na versão web

import React, { useEffect, useState } from 'react';

// Simulação dos serviços (deves adaptar ao que tiveres no backend/localStorage)
const isNotificationsEnabled = async () => {
  return localStorage.getItem('notifications_enabled') === 'true';
};

const setNotificationsEnabled = async (value) => {
  localStorage.setItem('notifications_enabled', value);
};

const getNotificationRadius = async () => {
  return parseInt(localStorage.getItem('notification_radius') || '20', 10);
};

const setNotificationRadius = async (value) => {
  localStorage.setItem('notification_radius', value);
};

export default function AccountSettings() {
  const [enabled, setEnabled] = useState(true);
  const [radius, setRadius] = useState('20');

  useEffect(() => {
    const load = async () => {
      setEnabled(await isNotificationsEnabled());
      const r = await getNotificationRadius();
      setRadius(String(r));
    };
    load();
  }, []);

  const toggleNotifications = async () => {
    const val = !enabled;
    setEnabled(val);
    await setNotificationsEnabled(val);
  };

  const changeRadius = async (value) => {
    setRadius(String(value));
    await setNotificationRadius(value);
  };

  return (
    <div className="form-box">
      <h2 className="title">Definições da Conta</h2>

      <div className="form">
        <div className="form-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
            <span>Notificações Ativas</span>
            <label className="checkbox-container">
              <input type="checkbox" checked={enabled} onChange={toggleNotifications} />
              <span className="checkmark"></span>
            </label>
          </div>

          <label style={{ display: 'block', marginBottom: '0.5rem' }}>Raio de Alertas (metros):</label>
          <select
            value={radius}
            onChange={(e) => changeRadius(e.target.value)}
            className="input"
          >
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>
    </div>
  );
}

// (em português) Estilos incluídos no mesmo ficheiro
