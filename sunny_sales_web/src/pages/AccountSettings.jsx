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
    <div style={styles.container}>
      <h2 style={styles.title}>Definições da Conta</h2>

      {/* Interruptor de notificações */}
      <div style={styles.row}>
        <span>Notificações Ativas</span>
        <input type="checkbox" checked={enabled} onChange={toggleNotifications} />
      </div>

      {/* Seletor de raio */}
      <label style={styles.label}>Raio de Alertas (metros):</label>
      <select
        value={radius}
        onChange={(e) => changeRadius(e.target.value)}
        style={styles.select}
      >
        <option value="20">20</option>
        <option value="50">50</option>
        <option value="100">100</option>
      </select>
    </div>
  );
}

// (em português) Estilos incluídos no mesmo ficheiro
const styles = {
  container: {
    padding: '2rem',
    maxWidth: '500px',
    margin: 'auto',
    backgroundColor: '#f6f6f6',
    borderRadius: '12px',
    marginTop: '3rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  title: {
    marginBottom: '1.5rem',
    fontSize: '1.5rem',
    textAlign: 'center',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
  },
  select: {
    width: '100%',
    padding: '0.5rem',
    borderRadius: '8px',
    fontSize: '1rem',
  },
};
