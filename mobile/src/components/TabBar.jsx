import React from 'react';
import { FiMapPin, FiShoppingBag, FiStar, FiUser } from 'react-icons/fi';
import { RiQrCodeLine } from 'react-icons/ri';
import './TabBar.css';

export const TABS = [
  { id: 'map', label: 'Mapa', icon: FiMapPin },
  { id: 'products', label: 'Produtos', icon: FiShoppingBag },
  { id: 'premium', label: 'Premium', icon: FiStar },
  { id: 'qr', label: 'QR Code', icon: RiQrCodeLine },
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
              <Icon size={20} strokeWidth={2} />
            </span>
            <span className="ss-tab-label">{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
