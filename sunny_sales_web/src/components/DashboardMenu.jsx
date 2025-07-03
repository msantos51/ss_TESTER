import React, { useState } from 'react';
import './DashboardMenu.css';

export default function DashboardMenu({ children }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="dashboard-menu">
      <button
        type="button"
        aria-label="Menu"
        className="setting-btn"
        onClick={() => setOpen(o => !o)}
      >
        <div className="bar bar1" />
        <div className="bar bar2" />
      </button>
      <nav className={`popup-window${open ? ' open' : ''}`} onClick={() => setOpen(false)}>
        {children}
      </nav>
    </div>
  );
}
