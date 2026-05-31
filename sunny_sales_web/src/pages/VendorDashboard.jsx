import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import axios from 'axios';
import {
  FiMap, FiBarChart2, FiCalendar, FiUser, FiFileText, FiClock,
  FiCreditCard, FiShield, FiMail, FiMapPin, FiLogOut, FiMenu, FiX,
  FiChevronRight,
} from 'react-icons/fi';
import './VendorDashboard.css';

let watchId = null;

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 19) return 'Boa tarde';
  return 'Boa noite';
}

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

  const navItem = (label, onClick, icon) => (
    <button className="vd-menu-item" onClick={() => { onClick(); setMenuOpen(false); }}>
      <span className="vd-menu-icon">{icon}</span>
      <span className="vd-menu-item-label">{label}</span>
      <FiChevronRight className="vd-menu-chevron" />
    </button>
  );

  const subscriptionActive = vendor?.subscription_active;
  const subscriptionDate = vendor?.subscription_valid_until
    ? new Date(vendor.subscription_valid_until).toLocaleDateString('pt-PT')
    : null;

  return (
    <div className="vd-wrapper">
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
          {navItem('Pagar Semanalidade', paySubscription, <FiCreditCard />)}
          {navItem('Semanas Pagas', () => navigate('/paid-weeks'), <FiCalendar />)}
          {navItem('Faturas', () => navigate('/invoices'), <FiFileText />)}
        </div>

        <div className="vd-menu-divider" />

        <div className="vd-menu-section">
          <span className="vd-menu-section-label">Atividade</span>
          {navItem('Trajetos', () => navigate('/routes'), <FiMap />)}
          {navItem('Distância Percorrida', () => navigate('/stats'), <FiBarChart2 />)}
          {navItem('Sessões', () => navigate('/sessions'), <FiClock />)}
        </div>

        <div className="vd-menu-divider" />

        <div className="vd-menu-section">
          {navItem('Atualizar Dados Pessoais', () => navigate('/account'), <FiUser />)}
        </div>

        <div className="vd-menu-divider" />

        <div className="vd-menu-section">
          {navItem('Termos e Condições', () => navigate('/terms'), <FiShield />)}
          {navItem('Contactar Suporte', () => { window.location.href = 'mailto:suporte@sunnysales.com'; }, <FiMail />)}
        </div>
      </aside>

      {/* Main content */}
      <div className="vd-container">

        {/* Greeting */}
        {vendor && (
          <div className="vd-greeting">
            <div className="vd-greeting-row">
              <div>
                <span className="vd-greeting-time">{getGreeting()},</span>
                <h2 className="vd-greeting-name">{vendor.name.split(' ')[0]}</h2>
              </div>
              <button
                ref={menuButtonRef}
                className="vd-menu-toggle"
                onClick={() => setMenuOpen((o) => !o)}
                aria-label="Menu"
                aria-expanded={menuOpen}
              >
                {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
              </button>
            </div>
          </div>
        )}

        {/* Profile card */}
        {vendor && (
          <div className="vd-profile-card">
            <div className="vd-profile-top">
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
              <div className="vd-profile-meta">
                <span className="vd-profile-name">{vendor.name}</span>
                <span className="vd-profile-product">{vendor.product}</span>
                <span className={`vd-sub-badge${subscriptionActive ? ' active' : ' inactive'}`}>
                  <span className="vd-sub-dot" />
                  {subscriptionActive
                    ? <>Ativa{subscriptionDate && <span className="vd-sub-date"> · {subscriptionDate}</span>}</>
                    : 'Inativa'}
                </span>
              </div>
            </div>

            <div className="vd-profile-divider" />

            <div className="vd-profile-details">
              <div className="vd-detail-item">
                <span className="vd-detail-label">Email</span>
                <span className="vd-detail-value">{vendor.email}</span>
              </div>
              <div className="vd-detail-item">
                <span className="vd-detail-label">Cor do Pin</span>
                <span className="vd-detail-value vd-pin-row">
                  <span
                    className="vd-pin-dot"
                    style={{ backgroundColor: vendor.pin_color || '#FFB6C1' }}
                  />
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Subscription CTA if inactive */}
        {vendor && !subscriptionActive && (
          <div className="vd-cta-card">
            <div className="vd-cta-text">
              <span className="vd-cta-title">Subscrição Inativa</span>
              <span className="vd-cta-desc">Ative para aparecer no mapa</span>
            </div>
            <button className="vd-cta-btn" onClick={paySubscription}>
              Ativar
            </button>
          </div>
        )}

        {/* Location sharing */}
        <div className={`vd-location-card${sharing ? ' active' : ''}`}>
          <div className="vd-location-icon-wrap">
            <FiMapPin className="vd-location-icon" />
            {sharing && <span className="vd-location-pulse" />}
          </div>
          <div className="vd-location-text">
            <span className="vd-location-title">Partilha de Localização</span>
            <span className="vd-location-status">
              {sharing ? 'Ativo — visível no mapa' : 'Desligado'}
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

        {/* Quick actions grid */}
        <div className="vd-quick-grid">
          <button className="vd-quick-item" onClick={() => navigate('/routes')}>
            <span className="vd-quick-icon"><FiMap /></span>
            <span className="vd-quick-label">Trajetos</span>
          </button>
          <button className="vd-quick-item" onClick={() => navigate('/stats')}>
            <span className="vd-quick-icon"><FiBarChart2 /></span>
            <span className="vd-quick-label">Estatísticas</span>
          </button>
          <button className="vd-quick-item" onClick={() => navigate('/paid-weeks')}>
            <span className="vd-quick-icon"><FiCalendar /></span>
            <span className="vd-quick-label">Subscrição</span>
          </button>
          <button className="vd-quick-item" onClick={() => navigate('/account')}>
            <span className="vd-quick-icon"><FiUser /></span>
            <span className="vd-quick-label">Perfil</span>
          </button>
        </div>

        <button className="vd-logout-btn" onClick={logout}>
          <FiLogOut size={15} />
          Terminar Sessão
        </button>
      </div>
    </div>
  );
}
