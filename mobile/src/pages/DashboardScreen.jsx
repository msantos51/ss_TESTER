import React, { useState } from 'react';
import {
  FiUser, FiSend, FiCheckSquare, FiCalendar,
  FiFileText, FiMail, FiLogOut, FiShoppingBag,
  FiChevronRight, FiExternalLink, FiMap
} from 'react-icons/fi';
import { BASE_URL, WEB_URL, mediaUrl } from '../config.js';
import ProfileScreen from './ProfileScreen.jsx';
import PlansScreen from './PlansScreen.jsx';
import RoutesScreen from './RoutesScreen.jsx';
import ProductsScreen from './ProductsScreen.jsx';
import InvoicesScreen from './InvoicesScreen.jsx';

export default function DashboardScreen({ auth, onChangePage, onLogout, onUserUpdate }) {
  const { user } = auth;
  const [showProfile, setShowProfile] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [showRoutes, setShowRoutes] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);

  const subscriptionActive = user?.subscription_active;
  const subscriptionDate = user?.subscription_valid_until
    ? new Date(user.subscription_valid_until).toLocaleDateString('pt-PT')
    : null;

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${BASE_URL}/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch {}
    onLogout();
  };

  const openWebsite = (path) => {
    window.open(`${WEB_URL}/#${path}`, '_system');
  };

  // Menus agrupados (foto em cima, menus em baixo)
  const menuGroups = [
    {
      label: 'Conta',
      items: [
        { icon: <FiUser />, label: 'Perfil', desc: 'Ver e editar informações', onClick: () => setShowProfile(true) },
      ],
    },
    {
      label: 'Atividade',
      items: [
        { icon: <FiMap />, label: 'Mapa', desc: 'Voltar ao mapa', onClick: () => onChangePage('map') },
        { icon: <FiSend />, label: 'Trajetos', desc: 'Consultar histórico de rotas', onClick: () => setShowRoutes(true) },
      ],
    },
    {
      label: 'Negócio',
      items: [
        { icon: <FiShoppingBag />, label: 'Produtos', desc: 'Adicionar e gerir produtos', onClick: () => setShowProducts(true) },
        {
          icon: <FiCheckSquare />,
          label: 'Subscrição',
          value: subscriptionActive ? 'Ativa' : 'Inativa',
          valueClass: subscriptionActive ? 'on' : 'off',
          onClick: () => setShowPlans(true),
        },
        { icon: <FiCalendar />, label: 'Semanas pagas', external: true, onClick: () => openWebsite('/paid-weeks') },
        { icon: <FiFileText />, label: 'Faturas', desc: 'Consultar faturas e recibos', onClick: () => setShowInvoices(true) },
      ],
    },
    {
      label: 'Suporte',
      items: [
        { icon: <FiMail />, label: 'Contactar suporte', external: true, onClick: () => openWebsite('/contacto') },
      ],
    },
  ];

  return (
    <div className="dashboard-screen">
      {/* Foto em cima (cartão de perfil) */}
      {user && (
        <button className="dash-profile-head" onClick={() => setShowProfile(true)}>
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
          <div className="dash-profile-head-meta">
            <span className="dash-profile-head-name">{user.name}</span>
            <span className="dash-profile-head-email">{user.email}</span>
            <span className={`dashboard-sub-badge${subscriptionActive ? ' active' : ' inactive'}`}>
              <span className="dashboard-sub-dot" />
              {subscriptionActive
                ? <>Subscrição ativa{subscriptionDate && <span className="dashboard-sub-date"> · {subscriptionDate}</span>}</>
                : 'Subscrição inativa'}
            </span>
          </div>
          <FiChevronRight className="dash-menu-row-chevron" />
        </button>
      )}

      {/* CTA de subscrição inativa */}
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

      {/* Menus em baixo (formato lista agrupada) */}
      {menuGroups.map((group) => (
        <div className="dash-menu-section" key={group.label}>
          <span className="dash-menu-section-label">{group.label}</span>
          <div className="dash-menu-group">
            {group.items.map((item) => (
              <button key={item.label} className="dash-menu-row" onClick={item.onClick}>
                <span className="dash-menu-row-icon">{item.icon}</span>
                <span className="dash-menu-row-label">{item.label}</span>
                {item.value && (
                  <span className={`dash-menu-row-value ${item.valueClass || ''}`}>{item.value}</span>
                )}
                {item.external
                  ? <FiExternalLink className="dash-menu-row-chevron" />
                  : <FiChevronRight className="dash-menu-row-chevron" />}
              </button>
            ))}
          </div>
        </div>
      ))}

      <div className="dash-menu-section">
        <div className="dash-menu-group">
          <button className="dash-menu-row danger" onClick={handleLogout}>
            <span className="dash-menu-row-icon"><FiLogOut /></span>
            <span className="dash-menu-row-label">Terminar Sessão</span>
          </button>
        </div>
      </div>

      {showProfile && (
        <ProfileScreen auth={auth} onClose={() => setShowProfile(false)} onUserUpdate={onUserUpdate} />
      )}

      {showPlans && (
        <PlansScreen auth={auth} onClose={() => setShowPlans(false)} />
      )}

      {showRoutes && (
        <RoutesScreen auth={auth} onClose={() => setShowRoutes(false)} />
      )}

      {showProducts && (
        <ProductsScreen auth={auth} onClose={() => setShowProducts(false)} />
      )}

      {showInvoices && (
        <InvoicesScreen auth={auth} onClose={() => setShowInvoices(false)} />
      )}
    </div>
  );
}
