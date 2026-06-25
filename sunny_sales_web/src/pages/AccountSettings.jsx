import React, { useEffect, useState } from 'react';
import { FiBell, FiRadio } from 'react-icons/fi';
import BackHomeButton from '../components/BackHomeButton';
import './VendorPage.css';

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
    <div className="vendor-page">
      <BackHomeButton />

      <div className="vendor-hero">
        <FiBell className="vendor-hero-icon" />
        <h1 className="vendor-hero-title">Definições da Conta</h1>
        <p className="vendor-hero-lead">
          Personalize suas preferências de notificações e alertas.
        </p>
      </div>

      <div className="vendor-section">
        <h2 className="vendor-section-title"><FiBell size={18} /> Notificações</h2>
        <div className="vendor-card">
          <div className="vendor-card-title">Ativar Notificações</div>
          <p className="vendor-card-text">
            Receba alertas quando clientes se aproximarem de sua localização.
          </p>
          <div style={{ marginTop: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={enabled}
                onChange={toggleNotifications}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                {enabled ? 'Ativado' : 'Desativado'}
              </span>
            </label>
          </div>
        </div>
      </div>

      <div className="vendor-section">
        <h2 className="vendor-section-title"><FiRadio size={18} /> Raio de Alertas</h2>
        <div className="vendor-card">
          <div className="vendor-card-title">Distância de Notificação</div>
          <p className="vendor-card-text">
            Escolha a distância mínima para receber notificações.
          </p>
          <div className="vendor-field" style={{ marginTop: '12px' }}>
            <label className="vendor-label">Raio em Metros</label>
            <select
              className="vendor-select"
              value={radius}
              onChange={(e) => changeRadius(e.target.value)}
            >
              <option value="20">20 metros</option>
              <option value="50">50 metros</option>
              <option value="100">100 metros</option>
            </select>
            <small style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '4px' }}>
              Raio atual: {radius}m
            </small>
          </div>
        </div>
      </div>
    </div>
  );
}
