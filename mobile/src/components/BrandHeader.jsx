import React from 'react';
import './BrandHeader.css';

// (em português) Cabeçalho da marca, comum aos cinco separadores: faixa em
// gradiente azul com o selo amarelo e o nome "Vendedor de Praia" no topo.
// No mapa é uma faixa compacta (`compact`), com o estado da partilha à
// direita (`aside`); nos restantes ecrãs tem os cantos de baixo arredondados
// e leva por baixo do selo o título e o resumo do ecrã (`children`).
export default function BrandHeader({ compact = false, aside = null, children }) {
  return (
    <header className={`brand-header${compact ? ' is-compact' : ''}`}>
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
