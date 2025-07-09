import React from 'react';
import './LoadingDots.css';

// Componente de indicador de carregamento com três pontos animados
export default function LoadingDots() {
  return (
    <div className="dots-container" aria-label="A carregar" role="status">
      <div className="dot" />
      <div className="dot" />
      <div className="dot" />
    </div>
  );
}
