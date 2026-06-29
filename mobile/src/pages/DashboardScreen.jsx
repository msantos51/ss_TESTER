import React, { useState } from 'react';
import {
  FiUser, FiMapPin, FiDollarSign, FiSmartphone, FiTerminal,
  FiCreditCard, FiWifi, FiSend, FiCheckSquare, FiCalendar,
  FiFileText, FiMail, FiLogOut, FiMap
} from 'react-icons/fi';
import { BASE_URL, mediaUrl } from '../config.js';
import ProfileScreen from './ProfileScreen.jsx';
import PlansScreen from './PlansScreen.jsx';
import MapTab from './MapTab.jsx';

const PAYMENT_ICONS = {
  'Numerário': <FiDollarSign />,
  'MB Way': <FiSmartphone />,
  'Multibanco': <FiTerminal />,
  'Cartão': <FiCreditCard />,
  'NFC': <FiWifi />,
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 19) return 'Boa tarde';
  return 'Boa noite';
}

export default function DashboardScreen({ auth, onLogout, onUserUpdate }) {
  const { user } = auth;
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  const [showPlans, setShowPlans] = useState(false);

  const subscriptionActive = user?.subscription_active;
  const subscriptionDate = user?.subscription_valid_until
    ? new Date(user.subscription_valid_until).toLocaleDateString('pt-PT')
    : null;

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    const vendorId = localStorage.getItem('vendorId');
    try {
      await fetch(`${BASE_URL}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {}
    onLogout();
  };

  if (activeTab === 'map') {
    return (
      <MapTab
        auth={auth}
        onChangeTab={setActiveTab}
        onLogout={onLogout}
        onUserUpdate={onUserUpdate}
      />
    );
  }

  return (
    <div className="dashboard-screen">
      {/* Hero Section */}
      {user && (
        <div className="dashboard-hero">
          <h1 className="dashboard-hero-title">Bem-vindo de volta!</h1>
          <p className="dashboard-hero-subtitle">
            Gerencie sua presença no mapa e mantenha seus clientes sempre informados.
          </p>
        </div>
      )}

      {/* Greeting */}
      {user && (
        <div className="dashboard-greeting">
          <span className="dashboard-greeting-time">{getGreeting()},</span>
          <h2 className="dashboard-greeting-name">{user.name.split(' ')[0]}</h2>
        </div>
      )}

      {/* Profile card */}
      {user && (
        <div className="dashboard-profile-card">
          <div className="dashboard-profile-top">
            {user.profile_photo ? (
              <img
                src={mediaUrl(user.profile_photo)}
                alt="Foto de perfil"
                className="dashboard-avatar"
                style={{ borderColor: user.pin_color || '#7B61FF' }}
              />
            ) : (
              <div
                className="dashboard-avatar dashboard-avatar-placeholder"
                style={{
                  borderColor: user.pin_color || '#7B61FF',
                  background: `${user.pin_color || '#7B61FF'}22`,
                  color: user.pin_color || '#7B61FF'
                }}
              >
                {user.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
            )}
            <div className="dashboard-profile-meta">
              <span className="dashboard-profile-name">{user.name}</span>
              <span className="dashboard-profile-product">{user.product}</span>
              <span className={`dashboard-sub-badge${subscriptionActive ? ' active' : ' inactive'}`}>
                <span className="dashboard-sub-dot" />
                {subscriptionActive
                  ? <>Ativa{subscriptionDate && <span className="dashboard-sub-date"> · {subscriptionDate}</span>}</>
                  : 'Inativa'}
              </span>
            </div>
          </div>

          <div className="dashboard-profile-divider" />

          <div className="dashboard-profile-details">
            <div className="dashboard-detail-row">
              <span className="dashboard-detail-row-icon"><FiMail /></span>
              <span className="dashboard-detail-row-label">EMAIL</span>
              <span className="dashboard-detail-row-value">{user.email}</span>
            </div>
            <div className="dashboard-detail-row">
              <span className="dashboard-detail-row-icon">
                <span className="dashboard-pin-dot" style={{ backgroundColor: user.pin_color || '#7B61FF' }} />
              </span>
              <span className="dashboard-detail-row-label">COR DO PIN</span>
            </div>
            {user.payment_methods && (
              <div className="dashboard-detail-row dashboard-detail-row-payments">
                <span className="dashboard-detail-row-icon"><FiCreditCard /></span>
                <span className="dashboard-detail-row-label">PAGAMENTOS</span>
                <div className="dashboard-payments-row">
                  {user.payment_methods.split(',').filter(Boolean).map(m => (
                    <span key={m} className="dashboard-payment-badge" title={m}>
                      <span className="dashboard-payment-badge-icon">{PAYMENT_ICONS[m] || <FiCreditCard />}</span>
                      <span className="dashboard-payment-badge-label">{m}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Subscription CTA if inactive */}
      {user && !subscriptionActive && (
        <div className="dashboard-cta-card">
          <div className="dashboard-cta-text">
            <span className="dashboard-cta-title">Subscrição Inativa</span>
            <span className="dashboard-cta-desc">Ative para aparecer no mapa</span>
          </div>
          <button className="dashboard-cta-btn" onClick={() => setShowPlans(true)}>
            Ativar
          </button>
        </div>
      )}

      {/* Quick actions grid */}
      <div className="dashboard-quick-grid">
        <button className="dashboard-quick-card" onClick={() => setActiveTab('map')}>
          <span className="dashboard-quick-icon"><FiMap /></span>
          <span className="dashboard-quick-label">Mapa</span>
          <span className="dashboard-quick-desc">Ver localização no mapa</span>
        </button>
        <button className="dashboard-quick-card" onClick={() => setShowProfile(true)}>
          <span className="dashboard-quick-icon"><FiUser /></span>
          <span className="dashboard-quick-label">Perfil</span>
          <span className="dashboard-quick-desc">Ver e editar informações</span>
        </button>
        <button className="dashboard-quick-card" onClick={() => setShowPlans(true)}>
          <span className="dashboard-quick-icon"><FiCheckSquare /></span>
          <span className="dashboard-quick-label">Subscrição</span>
          <span className="dashboard-quick-desc">Ativar ou renovar plano</span>
        </button>
      </div>

      <button className="dashboard-logout-btn" onClick={handleLogout}>
        <FiLogOut size={15} />
        Terminar Sessão
      </button>

      {showProfile && (
        <ProfileScreen auth={auth} onClose={() => setShowProfile(false)} onUserUpdate={onUserUpdate} />
      )}

      {showPlans && (
        <PlansScreen auth={auth} onClose={() => setShowPlans(false)} />
      )}
    </div>
  );
}
