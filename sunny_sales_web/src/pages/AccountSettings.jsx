import React, { useEffect, useState } from 'react';
import BackHomeButton from '../components/BackHomeButton';

const isNotificationsEnabled = () =>
  localStorage.getItem('notifications_enabled') === 'true';

const setNotificationsEnabled = (value) => {
  localStorage.setItem('notifications_enabled', value);
};

const getNotificationRadius = () =>
  parseInt(localStorage.getItem('notification_radius') || '20', 10);

const setNotificationRadius = (value) => {
  localStorage.setItem('notification_radius', value);
};

export default function AccountSettings() {
  const [enabled, setEnabled] = useState(true);
  const [radius, setRadius] = useState('20');

  useEffect(() => {
    setEnabled(isNotificationsEnabled());
    setRadius(String(getNotificationRadius()));
  }, []);

  const toggleNotifications = () => {
    const val = !enabled;
    setEnabled(val);
    setNotificationsEnabled(val);
  };

  const changeRadius = (value) => {
    setRadius(String(value));
    setNotificationRadius(value);
  };

  return (
    <div className="form-box">
      <BackHomeButton />
      <h2 className="title">Definições da Conta</h2>

      <div className="form">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span>Notificações Ativas</span>
          <input
            type="checkbox"
            className="theme-checkbox"
            checked={enabled}
            onChange={toggleNotifications}
          />
        </div>

        <span className="input-span">
          <label className="label">Raio de Alertas (metros):</label>
          <select
            value={radius}
            onChange={(e) => changeRadius(e.target.value)}
          >
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </span>
      </div>
    </div>
  );
}
