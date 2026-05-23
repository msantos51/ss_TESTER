import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import axios from 'axios';
import './VendorDashboard.css';

let watchId = null;

export default function VendorDashboard() {
  const [vendor, setVendor] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const sideMenuRef = useRef(null);
  const navigate = useNavigate();

  const logout = () => {
    stopSharing();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/vendor-login');
  };

  const startSharing = useCallback(async () => {
    if (!vendor) return;
    const expires = vendor.subscription_valid_until
      ? new Date(vendor.subscription_valid_until)
      : null;
    if (!vendor.subscription_active || (expires && expires < new Date())) {
      alert('Não consegue partilhar a localização porque não tem a subscrição ativa');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.post(`${BASE_URL}/vendors/${vendor.id}/routes/start`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          try {
            await axios.put(
              `${BASE_URL}/vendors/${vendor.id}/location`,
              { lat: pos.coords.latitude, lng: pos.coords.longitude },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (err) {
            console.error('Erro ao enviar localização:', err);
          }
        },
        (err) => console.error('Erro localização:', err),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
      localStorage.setItem('sharingLocation', 'true');
      setSharing(true);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        alert('Não consegue partilhar a localização porque não tem a subscrição ativa');
      } else {
        console.error('Erro ao ativar localização:', err);
      }
    }
  }, [vendor]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setVendor(JSON.parse(stored));
    const share = localStorage.getItem('sharingLocation') === 'true';
    setSharing(share);
  }, []);

  useEffect(() => {
    if (sharing && vendor && watchId === null) startSharing();
  }, [sharing, vendor, startSharing]);

  const stopSharing = async () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    if (vendor) {
      const token = localStorage.getItem('token');
      try {
        await axios.post(`${BASE_URL}/vendors/${vendor.id}/routes/stop`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error('Erro ao parar localização:', err);
      }
    }
    localStorage.setItem('sharingLocation', 'false');
    setSharing(false);
  };

  const paySubscription = async () => {
    if (!vendor) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${BASE_URL}/vendors/${vendor.id}/create-checkout-session`,
        null,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (res.data.checkout_url) window.open(res.data.checkout_url, '_blank');
    } catch (err) {
      console.error('Erro no pagamento:', err);
    }
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (
        sideMenuRef.current &&
        !sideMenuRef.current.contains(e.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    const handleKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKey);
    };
  }, [menuOpen]);

  const navItem = (label, onClick, icon = null) => (
    <button className="vd-menu-item" onClick={() => { onClick(); setMenuOpen(false); }}>
      {icon && <span className="vd-menu-icon">{icon}</span>}
      {label}
    </button>
  );

  return (
    <div className="vd-wrapper">
      {/* Side menu toggle */}
      <button
        ref={menuButtonRef}
        className="vd-menu-toggle"
        onClick={() => setMenuOpen((o) => !o)}
        aria-label="Menu"
        aria-expanded={menuOpen}
      >
        {menuOpen ? '✕' : '☰'}
      </button>

      {/* Side menu overlay */}
      {menuOpen && (
        <div className="vd-overlay" onClick={() => setMenuOpen(false)} aria-hidden="true" />
      )}

      {/* Side menu */}
      <aside
        ref={sideMenuRef}
        className={`vd-side-menu${menuOpen ? ' open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <div className="vd-menu-header">
          <span className="vd-menu-title">Menu</span>
        </div>

        <div className="vd-menu-section">
          <span className="vd-menu-section-label">Subscrição</span>
          {navItem('Pagar Semanalidade', paySubscription, '💳')}
          {navItem('Semanas Pagas', () => navigate('/paid-weeks'), '📅')}
          {navItem('Faturas', () => navigate('/invoices'), '🧾')}
        </div>

        <div className="vd-menu-divider" />

        <div className="vd-menu-section">
          <span className="vd-menu-section-label">Atividade</span>
          {navItem('Trajetos', () => navigate('/routes'), '🗺️')}
          {navItem('Distância Percorrida', () => navigate('/stats'), '📊')}
          {navItem('Sessões', () => navigate('/sessions'), '⏱️')}
        </div>

        <div className="vd-menu-divider" />

        <div className="vd-menu-section">
          {navItem('Atualizar Dados Pessoais', () => navigate('/account'), '👤')}
        </div>

        <div className="vd-menu-divider" />

        <div className="vd-menu-section">
          {navItem('Termos e Condições', () => navigate('/terms'), '📋')}
          {navItem('Contactar Suporte', () => { window.location.href = 'mailto:suporte@sunnysales.com'; }, '✉️')}
        </div>
      </aside>

      {/* Main content */}
      <div className="vd-container">
        <h2 className="vd-title">Painel do Vendedor</h2>

        {vendor && (
          <div className="vd-info-card">
            {vendor.profile_photo ? (
              <img
                src={`${BASE_URL.replace(/\/$/, '')}/${vendor.profile_photo}`}
                alt="Foto de perfil"
                className="vd-avatar"
              />
            ) : (
              <div className="vd-avatar vd-avatar-placeholder">
                {vendor.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}

            <div className="vd-info-grid">
              <div className="vd-info-row">
                <span className="vd-info-label">Nome</span>
                <span className="vd-info-value">{vendor.name}</span>
              </div>
              <div className="vd-info-row">
                <span className="vd-info-label">Email</span>
                <span className="vd-info-value">{vendor.email}</span>
              </div>
              <div className="vd-info-row">
                <span className="vd-info-label">Produto</span>
                <span className="vd-info-value">{vendor.product}</span>
              </div>
              <div className="vd-info-row">
                <span className="vd-info-label">Cor do Pin</span>
                <span className="vd-info-value vd-pin-row">
                  <span
                    className="vd-pin-dot"
                    style={{ backgroundColor: vendor.pin_color || '#FFB6C1' }}
                  />
                  {vendor.pin_color || '#FFB6C1'}
                </span>
              </div>
              <div className="vd-info-row">
                <span className="vd-info-label">Subscrição</span>
                <span className={`vd-info-value vd-sub-badge${vendor.subscription_active ? ' active' : ' inactive'}`}>
                  {vendor.subscription_active ? (
                    <>
                      Ativa
                      {vendor.subscription_valid_until && (
                        <span className="vd-sub-date">
                          &nbsp;até {new Date(vendor.subscription_valid_until).toLocaleDateString('pt-PT')}
                        </span>
                      )}
                    </>
                  ) : (
                    'Inativa'
                  )}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Location sharing toggle */}
        <div className="vd-toggle-card">
          <div className="vd-toggle-info">
            <span className="vd-toggle-title">Partilha de Localização</span>
            <span className={`vd-toggle-status${sharing ? ' on' : ''}`}>
              {sharing ? 'Ligada — visível no mapa' : 'Desligada'}
            </span>
          </div>
          <label className="vendor-switch" aria-label="Ativar/desativar localização">
            <input
              type="checkbox"
              checked={sharing}
              onChange={sharing ? stopSharing : startSharing}
            />
            <span className="slider" />
          </label>
        </div>

        <button className="vd-logout-btn" onClick={logout}>
          Terminar Sessão
        </button>
      </div>
    </div>
  );
}
