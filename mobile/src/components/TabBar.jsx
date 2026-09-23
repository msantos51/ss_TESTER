import React from 'react';
import { FiMapPin, FiShoppingBag, FiStar, FiUser } from 'react-icons/fi';
import './TabBar.css';

// Ícone do QR Code desenhado no mesmo traço dos ícones Feather dos outros
// separadores (o do Remix saía como um quadrado cheio a 18px).
function QrIcon({ size = 18, strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={strokeWidth} strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

export const TABS = [
  { id: 'map', label: 'Mapa', icon: FiMapPin },
  { id: 'products', label: 'Produtos', icon: FiShoppingBag },
  { id: 'premium', label: 'Premium', icon: FiStar },
  { id: 'qr', label: 'QR Code', icon: QrIcon },
  { id: 'account', label: 'Conta', icon: FiUser },
];

export default function TabBar({ active, onChange }) {
  return (
    <nav className="ss-tabbar" aria-label="Navegação principal">
      {TABS.map(({ id, label, icon: Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            type="button"
            className={`ss-tab${isActive ? ' is-active' : ''}`}
            onClick={() => onChange(id)}
            aria-current={isActive ? 'page' : undefined}
          >
            <span className="ss-tab-pill">
              <Icon size={18} strokeWidth={2.2} />
            </span>
            <span className="ss-tab-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
