import React, { useState } from 'react';
import {
  FiUser, FiSend, FiCheckSquare,
  FiFileText, FiMail, FiLogOut, FiShoppingBag,
  FiChevronRight, FiExternalLink, FiMap
} from 'react-icons/fi';
import { WEB_URL, mediaUrl } from '../config.js';
import { terminateCurrentSession } from '../sessionApi.js';
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
    await terminateCurrentSession(auth.token);
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
        { icon: <FiFileText />, label: 'Faturas', desc: 'Semanas pagas e recibos', onClick: () => setShowInvoices(true) },
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
      {/* Hero header com gradiente */}
      <button className="dashboard-hero" onClick={() => setShowProfile(true)}>
        <div className="dashboard-hero-content">
          {user?.profile_photo ? (
            <img
              src={mediaUrl(user.profile_photo)}
              alt="Foto de perfil"
              className="dashboard-hero-avatar"
            />
          ) : (
            <div className="dashboard-hero-avatar dashboard-hero-avatar-placeholder">
              {user?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
          )}
          <div className="dashboard-hero-meta">
            <div className="dashboard-hero-name">{user?.name}</div>
            <div className="dashboard-hero-email">{user?.email}</div>
            <span className={`dashboard-hero-badge${subscriptionActive ? ' active' : ' inactive'}`}>
              <span className="dashboard-hero-dot" />
              {subscriptionActive
                ? <>Ativa{subscriptionDate && <> · {subscriptionDate}</>}</>
                : 'Inativa'}
            </span>
          </div>
          <FiChevronRight className="dashboard-hero-chevron" />
        </div>
      </button>

      <div className="dashboard-body">
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
