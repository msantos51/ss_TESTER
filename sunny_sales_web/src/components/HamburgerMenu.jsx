import React, { useState } from 'react';
import './HamburgerMenu.css';

export default function HamburgerMenu({ children, style }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative', ...style }}>
      {/* Botão hambúrguer */}
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

      {/* Menu lateral */}
      <nav
        className={`popup-window${open ? ' open' : ''}`}
        onClick={() => setOpen(false)}
      >
        {children}
      </nav>
    </div>
  );
}
