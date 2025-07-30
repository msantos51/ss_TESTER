// (em português) Página de definições de conta na versão web

import React, { useEffect, useState } from 'react';

// Simulação dos serviços (deves adaptar ao que tiveres no backend/localStorage)
// Obtém se as notificações estão ativas no localStorage
const isNotificationsEnabled = () =>
  localStorage.getItem('notifications_enabled') === 'true';

// Atualiza o estado de notificações no localStorage
const setNotificationsEnabled = (value) => {
  localStorage.setItem('notifications_enabled', value);
};

// Obtém o raio configurado
const getNotificationRadius = () =>
  parseInt(localStorage.getItem('notification_radius') || '20', 10);

// Guarda o raio de alertas
const setNotificationRadius = (value) => {
  localStorage.setItem('notification_radius', value);
};

// Componente que permite configurar notificações e raio de alertas
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

  // Alterna o estado das notificações
  const toggleNotifications = async () => {
    const val = !enabled;
    setEnabled(val);
    await setNotificationsEnabled(val);
  };

  // Atualiza o raio de alertas no localStorage
  const changeRadius = async (value) => {
    setRadius(String(value));
    await setNotificationRadius(value);
  };

  return (
    <div className="form-box">
      <h2 className="title">Definições da Conta</h2>

      <div className="form">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
          <span>Notificações Ativas</span>
          <label className="checkbox-container">
            <input type="checkbox" checked={enabled} onChange={toggleNotifications} />
            <span className="checkmark"></span>
          </label>
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

