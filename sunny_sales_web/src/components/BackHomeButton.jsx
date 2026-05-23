import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function BackHomeButton() {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate('/')}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        padding: '6px 10px',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '1rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        transition: 'color 0.18s, background 0.18s',
        boxShadow: 'none',
        minHeight: 'auto',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = 'var(--primary)';
        e.currentTarget.style.background = 'var(--primary-light)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = 'var(--text-secondary)';
        e.currentTarget.style.background = 'none';
      }}
    >
      ← Voltar
    </button>
  );
}
