import React from 'react';
import './BrandHeader.css';

// (em português) Cabeçalho da marca, comum aos cinco separadores: faixa em
// gradiente azul com cantos de baixo arredondados e, dentro, o título e o
// resumo do ecrã (`children`) — sempre a mesma estrutura (um título e uma
// linha de resumo), para que os cinco cabeçalhos fiquem com a mesma altura.
export default function BrandHeader({ children }) {
  return (
    <header className="brand-header">
      <div className="brand-header-body">{children}</div>
    </header>
  );
}
