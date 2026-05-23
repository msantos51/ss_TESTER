import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCreditCard, FiCalendar, FiFile, FiMap, FiTrendingUp,
  FiMonitor, FiSettings, FiBook, FiHelpCircle, FiLogOut,
  FiMenu, FiX,
} from 'react-icons/fi';
import { BASE_URL } from '../config';
import axios from 'axios';
import './VendorDashboard.css';

const PRODUCT_EMOJI = {
  'Bolas de Berlim': '🍩',
  'Gelados': '🍦',
  'Acessórios de Praia': '🏖️',
};

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
      if (err.response?.status === 403) {
        alert('Não consegue partilhar a localização porque não tem a subscrição ativa');
      } else {
        console.error('Erro ao ativar localização:', err);
      }
    }
  }, [vendor]);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setVendor(JSON.parse(stored));
    setSharing(localStorage.getItem('sharingLocation') === 'true');
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
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const nav = (path) => { navigate(path); setMenuOpen(false); };

  return (
    <div className="vd-wrapper">
      {/* Sidebar */}
      <aside className={`vd-sidebar${menuOpen ? ' open' : ''}`} ref={sideMenuRef}>
        <div className="vd-sidebar-header">
          <span>Menu</span>
          <button className="vd-sidebar-close" onClick={() => setMenuOpen(false)}>
            <FiX />
          </button>
        </div>
        <nav className="vd-sidebar-nav">
          <div className="vd-nav-section">
            <span className="vd-nav-label">Pagamentos</span>
            <button className="vd-nav-item" onClick={() => { paySubscription(); setMenuOpen(false); }}>
              <FiCreditCard /> Pagar Semanalidade
            </button>
            <button className="vd-nav-item" onClick={() => nav('/paid-weeks')}>
              <FiCalendar /> Semanas Pagas
            </button>
            <button className="vd-nav-item" onClick={() => nav('/invoices')}>
              <FiFile /> Faturas
            </button>
          </div>

          <div className="vd-nav-section">
            <span className="vd-nav-label">Atividade</span>
            <button className="vd-nav-item" onClick={() => nav('/routes')}>
              <FiMap /> Trajetos
            </button>
            <button className="vd-nav-item" onClick={() => nav('/stats')}>
              <FiTrendingUp /> Distância Percorrida
            </button>
            <button className="vd-nav-item" onClick={() => nav('/sessions')}>
              <FiMonitor /> Sessões
            </button>
          </div>

          <div className="vd-nav-section">
            <span className="vd-nav-label">Conta</span>
            <button className="vd-nav-item" onClick={() => nav('/account')}>
              <FiSettings /> Dados Pessoais
            </button>
          </div>

          <div className="vd-nav-section">
            <button className="vd-nav-item" onClick={() => nav('/terms')}>
              <FiBook /> Termos e Condições
            </button>
            <button className="vd-nav-item" onClick={() => { window.location.href = 'mailto:suporte@sunnysales.com'; setMenuOpen(false); }}>
              <FiHelpCircle /> Contactar Suporte
            </button>
          </div>
        </nav>
      </aside>

      {menuOpen && <div className="vd-overlay" onClick={() => setMenuOpen(false)} />}

      {/* Main */}
      <main className="vd-main">
        <div className="vd-topbar">
          <button className="vd-menu-btn" ref={menuButtonRef} onClick={() => setMenuOpen(true)}>
            <FiMenu /> Menu
          </button>
          <h2 className="vd-title">Painel do Vendedor</h2>
          <div style={{ width: 88 }} />
        </div>

        {vendor && (
          <div className="vd-profile-card">
            <div className="vd-profile-banner" style={{ background: vendor.pin_color || 'var(--color-primary)' }} />
            <div className="vd-avatar-wrap">
              {vendor.profile_photo ? (
                <img
                  src={`${BASE_URL.replace(/\/$/, '')}/${vendor.profile_photo}`}
                  alt="Foto"
                  className="vd-avatar"
                />
              ) : (
                <div className="vd-avatar vd-avatar-placeholder">
                  {vendor.name?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div className="vd-profile-body">
              <h3 className="vd-name">{vendor.name}</h3>
              <p className="vd-email">{vendor.email}</p>
              <div className="vd-badges">
                <span className="vd-product-badge">
                  {PRODUCT_EMOJI[vendor.product] || '🛍️'} {vendor.product}
                </span>
                <span className={`vd-sub-badge${vendor.subscription_active ? ' active' : ' inactive'}`}>
                  {vendor.subscription_active ? '✓ Subscrição Ativa' : '✗ Subscrição Inativa'}
                </span>
              </div>
              {vendor.subscription_active && vendor.subscription_valid_until && (
                <p className="vd-sub-expires">
                  Válida até {new Date(vendor.subscription_valid_until).toLocaleDateString('pt-PT')}
                </p>
              )}
            </div>
          </div>
        )}

        <div className={`vd-location-card${sharing ? ' sharing' : ''}`}>
          <div className="vd-location-info">
            <span className="vd-location-title">Partilha de Localização</span>
            <span className={`vd-location-status${sharing ? ' active' : ''}`}>
              {sharing ? '● A partilhar posição' : '○ Localização desligada'}
            </span>
          </div>
          <label className="vendor-switch">
            <input
              type="checkbox"
              checked={sharing}
              onChange={sharing ? stopSharing : startSharing}
            />
            <span className="slider" />
          </label>
        </div>

        <button className="vd-logout" onClick={logout}>
          <FiLogOut /> Terminar Sessão
        </button>
      </main>
    </div>
  );
}
