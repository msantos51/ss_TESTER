import React from 'react';
import './BrandHeader.css';

// (em português) Cabeçalho da marca, comum aos cinco separadores: faixa em
// gradiente azul com o selo amarelo e o nome "Vendedor de Praia" no topo,
// cantos de baixo arredondados, e por baixo o título e o resumo do ecrã
// (`children`) — sempre no mesmo tamanho e formato, em todos os
// separadores. O mapa acrescenta ainda o estado da partilha ao lado do
// nome da marca (`aside`).
export default function BrandHeader({ aside = null, children }) {
  return (
    <header className="brand-header">
      <div className="brand-header-top">
        <div className="brand-header-brand">
          <span className="brand-header-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8 2 5 5.2 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.8-3-7-7-7z" />
            </svg>
          </span>
          <span className="brand-header-name">Vendedor de Praia</span>
        </div>
        {aside}
      </div>
      {children && <div className="brand-header-body">{children}</div>}
    </header>
  );
}
