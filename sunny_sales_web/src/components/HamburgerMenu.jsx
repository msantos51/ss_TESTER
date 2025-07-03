import React, { useState } from 'react';

export default function HamburgerMenu({ children, style }) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'relative', ...style }}>
      {/* Botão hambúrguer */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Menu"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '10px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          height: '24px',
          width: '30px',
          zIndex: 1001,
        }}
      >
        <span
          style={{
            height: '3px',
            background: '#000',
            borderRadius: '2px',
            transition: '0.3s',
            transform: open ? 'rotate(45deg) translate(5px, 5px)' : 'none',
          }}
        />
        <span
          style={{
            height: '3px',
            background: '#000',
            borderRadius: '2px',
            transition: '0.3s',
            opacity: open ? 0 : 1,
          }}
        />
        <span
          style={{
            height: '3px',
            background: '#000',
            borderRadius: '2px',
            transition: '0.3s',
            transform: open ? 'rotate(-45deg) translate(5px, -5px)' : 'none',
          }}
        />
      </button>

      {/* Menu lateral */}
      {open && (
        <nav
          style={{
            position: 'absolute',
            top: '40px',
            left: 0,
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
            padding: '20px',
            zIndex: 1000,
          }}
          onClick={() => setOpen(false)}
        >
          {children}
        </nav>
      )}
    </div>
  );
}
