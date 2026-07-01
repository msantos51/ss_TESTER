import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome, FiUser, FiNavigation, FiShoppingBag,
  FiCreditCard, FiFileText, FiBell, FiSettings, FiLogOut
} from 'react-icons/fi';
import './VendorSidebar.css';

export default function VendorSidebar({ onLogout }) {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: <FiHome size={18} /> },
    { path: '/profile', label: 'Perfil', icon: <FiUser size={18} /> },
    { path: '/routes', label: 'Trajetos', icon: <FiNavigation size={18} /> },
    { path: '/products', label: 'Produtos', icon: <FiShoppingBag size={18} /> },
    { path: '/paid-weeks', label: 'Subscrições', icon: <FiCreditCard size={18} /> },
    { path: '/invoices', label: 'Faturas', icon: <FiFileText size={18} /> },
    { path: '/notifications', label: 'Notificações', icon: <FiBell size={18} /> },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="vendor-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <FiShoppingBag size={24} />
          <span>Sunny Sales</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="sidebar-nav-icon">{item.icon}</span>
            <span className="sidebar-nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <Link to="/settings" className="sidebar-nav-item">
          <span className="sidebar-nav-icon"><FiSettings size={18} /></span>
          <span className="sidebar-nav-label">Definições</span>
        </Link>
        <button className="sidebar-logout-btn" onClick={onLogout}>
          <span className="sidebar-nav-icon"><FiLogOut size={18} /></span>
          <span className="sidebar-nav-label">Terminar Sessão</span>
        </button>
      </div>
    </aside>
  );
}
