import React, { useState } from 'react';
import './HamburgerMenu.css';

export default function HamburgerMenu({ children, style }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="popup" style={style}>
      <button
        type="button"
        className={`burger${open ? ' open' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="Menu"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>
      <nav
        className={`popup-window${open ? ' open' : ''}`}
        onClick={() => setOpen(false)}
      >
        {children}
      </nav>
    </div>
  );
}
