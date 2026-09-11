import React, { useState, useEffect } from 'react';
import {
  FiUser, FiFileText, FiMail, FiLogOut, FiShoppingBag,
  FiChevronRight, FiExternalLink,
} from 'react-icons/fi';
import { BASE_URL, WEB_URL, mediaUrl } from '../config.js';
import { terminateCurrentSession } from '../sessionApi.js';
import ProfileScreen from './ProfileScreen.jsx';
import PlansScreen from './PlansScreen.jsx';
import InvoicesScreen from './InvoicesScreen.jsx';

export default function DashboardScreen({ auth, onChangePage, onLogout, onUserUpdate }) {
  const { user, token, vendorId } = auth;
  const [showProfile, setShowProfile] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);
  const [productCount, setProductCount] = useState(null);

  const subscriptionActive = user?.subscription_active;
  const subscriptionDate = user?.subscription_valid_until
    ? new Date(user.subscription_valid_until).toLocaleDateString('pt-PT')
    : null;

  // A linha "Produtos" mostra a contagem à direita, como no design.
  useEffect(() => {
    let active = true;
    fetch(`${BASE_URL}/vendors/${vendorId}/products`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => { if (active) setProductCount(Array.isArray(data) ? data.length : 0); })
      .catch(() => { if (active) setProductCount(null); });
    return () => { active = false; };
  }, [vendorId, token]);

  const handleLogout = async () => {
    await terminateCurrentSession(auth.token);
    onLogout();
  };

  // (em português) A conta foi eliminada: o servidor já apagou as sessões, por
  // isso basta limpar o estado local — chamar terminateCurrentSession aqui só
  // daria 401 contra uma conta que já não existe.
  const handleAccountDeleted = () => {
    setShowProfile(false);
    onLogout();
  };

  const openWebsite = (path) => {
    window.open(`${WEB_URL}/#${path}`, '_system');
  };

  const groups = [
    {
      label: 'Negócio',
      items: [
        {
          icon: <FiShoppingBag />,
          label: 'Produtos',
          value: productCount === null ? null : String(productCount),
          onClick: () => onChangePage('products'),
        },
        { icon: <FiFileText />, label: 'Faturas', onClick: () => setShowInvoices(true) },
        {
          icon: <FiMail />,
          label: 'Contactar suporte',
          external: true,
          onClick: () => openWebsite('/contacto'),
        },
      ],
    },
    {
      label: 'Conta',
      items: [
        { icon: <FiUser />, label: 'Perfil e dados', onClick: () => setShowProfile(true) },
        { icon: <FiLogOut />, label: 'Terminar sessão', danger: true, onClick: handleLogout },
      ],
    },
  ];

  const initial = user?.name?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="account-screen">
      {/* Cabeçalho de identidade */}
      <header className="account-header">
        {user?.profile_photo ? (
          <img src={mediaUrl(user.profile_photo)} alt="" className="account-avatar" />
        ) : (
          <span className="account-avatar account-avatar-initial">{initial}</span>
        )}

        <div className="account-identity">
          <span className="account-name">{user?.name}</span>
          <span className="account-email">{user?.email}</span>
          {user?.product && <span className="account-product">{user.product}</span>}
        </div>

        <button type="button" className="account-edit-btn" onClick={() => setShowProfile(true)}>
          Editar
        </button>
      </header>

      <div className="account-body">
        {/* Cartão de subscrição */}
        <div className={`account-sub-card${subscriptionActive ? ' is-active' : ''}`}>
          <div className="account-sub-text">
            <span className="account-sub-title">
              {subscriptionActive ? 'Subscrição ativa' : 'Subscrição inativa'}
            </span>
            <span className="account-sub-desc">
              {subscriptionActive
                ? `Válida até ${subscriptionDate || '—'}`
                : 'Ativa um plano para apareceres no mapa'}
            </span>
          </div>
          <button type="button" className="account-sub-btn" onClick={() => setShowPlans(true)}>
            {subscriptionActive ? 'Gerir' : 'Ativar'}
          </button>
        </div>

        {groups.map((group) => (
          <section className="ss-group" key={group.label}>
            <h2 className="ss-group-label">{group.label}</h2>
            <div className="ss-group-card">
              {group.items.map((item) => (
                <button
                  type="button"
                  key={item.label}
                  className={`ss-row${item.danger ? ' is-danger' : ''}`}
                  onClick={item.onClick}
                >
                  <span className="ss-row-icon">{item.icon}</span>
                  <span className="ss-row-label">{item.label}</span>
                  {item.value && <span className="ss-row-value">{item.value}</span>}
                  {!item.danger && (item.external
                    ? <FiExternalLink className="ss-row-chevron" />
                    : <FiChevronRight className="ss-row-chevron" />)}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      {showProfile && (
        <ProfileScreen
          auth={auth}
          onClose={() => setShowProfile(false)}
          onUserUpdate={onUserUpdate}
          onAccountDeleted={handleAccountDeleted}
        />
      )}

      {showPlans && <PlansScreen auth={auth} onClose={() => setShowPlans(false)} />}

      {showInvoices && <InvoicesScreen auth={auth} onClose={() => setShowInvoices(false)} />}
    </div>
  );
}
