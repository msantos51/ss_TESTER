// (em português) Componente do menu hambúrguer com menu lateral
import React, { useState } from 'react';
import './HamburgerMenu.css';

export default function HamburgerMenu({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="popup">
      {/* (em português) Botão de menu em forma de hambúrguer */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Menu"
        className={`burger${open ? ' open' : ''}`}
      >
        <span />
        <span />
        <span />
      </button>

      {/* (em português) Janela de menu que aparece ao clicar */}
      {open && <div className="menu-overlay" onClick={() => setOpen(false)} />}

      <nav
        className={`popup-window${open ? ' open' : ''}`}
        onClick={() => setOpen(false)}
      >
        {children}
      </nav>
    </div>
  );
}
