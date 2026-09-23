import React, { useState } from 'react';
import {
  FiUser, FiFileText, FiMail, FiLogOut,
  FiChevronRight, FiExternalLink,
} from 'react-icons/fi';
import { WEB_URL, mediaUrl } from '../config.js';
import { terminateCurrentSession } from '../sessionApi.js';
import ProfileScreen from './ProfileScreen.jsx';
import InvoicesScreen from './InvoicesScreen.jsx';
import BrandHeader from '../components/BrandHeader.jsx';

export default function DashboardScreen({ auth, onChangePage, onLogout, onUserUpdate }) {
  const { user } = auth;
  const [showProfile, setShowProfile] = useState(false);
  const [showInvoices, setShowInvoices] = useState(false);

  // (em português) O cartão do topo da Conta é o do Premium, a única compra da
  // plataforma: "Gerir" leva ao separador onde está tudo — o que ganha, o preço
  // e a renovação. Estar no mapa é gratuito, por isso não há mais nada aqui
  // para pagar nem folha de planos que abrir.
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
      <BrandHeader>
        <h2 className="brand-header-title">Conta</h2>
        <p className="brand-header-subtitle">{user?.name || user?.email || 'O teu perfil'}</p>
      </BrandHeader>

      <div className="account-body">
        {/* Identidade do vendedor, com o botão para editar o perfil */}
        <div className="account-identity-card">
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
        </div>

        {/* Cartão do Premium */}
        <div className={`account-sub-card${isPremium ? ' is-active' : ''}`}>
          <div className="account-sub-text">
            <span className="account-sub-title">
              {isPremium ? 'Premium ativo' : 'Ainda sem Premium'}
            </span>
            <span className="account-sub-desc">
              {isPremium
                ? `Válido até ${premiumDate || '—'}`
                : 'Estás no gratuito. Premium: estrela no pin, 1 km e fotos'}
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

      {showInvoices && <InvoicesScreen auth={auth} onClose={() => setShowInvoices(false)} />}
    </div>
  );
}
