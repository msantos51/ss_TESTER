import React, { useState } from 'react';
import {
  FiUser, FiFileText, FiMail, FiLogOut, FiMapPin,
  FiChevronRight, FiExternalLink,
} from 'react-icons/fi';
import { WEB_URL, mediaUrl } from '../config.js';
import { terminateCurrentSession } from '../sessionApi.js';
import ProfileScreen from './ProfileScreen.jsx';
import PlansScreen from './PlansScreen.jsx';
import InvoicesScreen from './InvoicesScreen.jsx';

export default function DashboardScreen({ auth, onChangePage, onLogout, onUserUpdate }) {
  const { user } = auth;
  const [showProfile, setShowProfile] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);

  const subscriptionActive = user?.subscription_active;
  const subscriptionDate = user?.subscription_valid_until
    ? new Date(user.subscription_valid_until).toLocaleDateString('pt-PT')
    : null;

  // (em português) O cartão do topo da Conta é o do Premium: é a compra que o
  // vendedor gere hoje, e "Gerir" leva-o ao separador onde está tudo — o que
  // ganha, o preço e a renovação. O plano de visibilidade continua a existir,
  // mas é uma linha da lista: quem o quer renovar sabe onde o procurar, e quem
  // abre a Conta deixa de cair numa folha de planos que já não é o assunto.
  const isPremium = Boolean(user?.is_premium);
  const premiumDate = user?.premium_valid_until
    ? new Date(user.premium_valid_until).toLocaleDateString('pt-PT')
    : null;

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
          icon: <FiMapPin />,
          // "Visibilidade" e não "Plano de visibilidade": com a data ao lado,
          // o rótulo mais longo parte-se em duas linhas num ecrã de 412 px e
          // não sobra nada para os telemóveis estreitos.
          label: 'Visibilidade',
          value: subscriptionActive ? subscriptionDate || 'Ativo' : 'Inativo',
          onClick: () => setShowPlans(true),
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
        {/* Cartão do Premium */}
        <div className={`account-sub-card${isPremium ? ' is-active' : ''}`}>
          <div className="account-sub-text">
            <span className="account-sub-title">
              {isPremium ? 'Premium ativo' : 'Ainda sem Premium'}
            </span>
            <span className="account-sub-desc">
              {isPremium
                ? `Válido até ${premiumDate || '—'}`
                : 'Estrela no pin, 1 km de alcance e fotos nos produtos'}
            </span>
          </div>
          <button
            type="button"
            className="account-sub-btn"
            onClick={() => onChangePage?.('premium')}
          >
            {isPremium ? 'Gerir' : 'Ativar'}
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
