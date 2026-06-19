import React from 'react';
import BackHomeButton from '../components/BackHomeButton';
import './InfoPage.css';

export default function Sustentabilidade() {
  return (
    <div className="info-page">
      <BackHomeButton />

      <div className="info-hero green">
        <h1 className="info-hero-title">Sustentabilidade</h1>
        <p className="info-hero-lead">
          Acreditamos que o futuro do comércio de praia deve ser mais{' '}
          <strong>eficiente, consciente e ecológico</strong>. Cada decisão conta para
          um litoral mais saudável e praias mais limpas.
        </p>
      </div>

      <div className="info-badges">
        <div className="info-badge">Emissões reduzidas</div>
        <div className="info-badge">Embalagens eco-friendly</div>
        <div className="info-badge">Praias mais limpas</div>
      </div>

      <div className="info-section">
        <h3 className="info-section-title">Consciencialização dos Banhistas</h3>
        <ul className="info-list">
          <li data-bullet="✓">
            Recolher todo o lixo após a permanência na praia, incluindo beatas e plásticos
            pequenos muitas vezes esquecidos.
          </li>
          <li data-bullet="✓">
            Utilizar cinzeiros portáteis para evitar a contaminação da areia e do mar.
          </li>
          <li data-bullet="✓">
            Preferir protetor solar com fórmulas de menor impacto nos ecossistemas marinhos
            e recifes de coral.
          </li>
          <li data-bullet="✓">
            Evitar plásticos descartáveis e optar por garrafas, canecas e utensílios
            reutilizáveis.
          </li>
          <li data-bullet="✓">
            Participar em ações de limpeza de praia organizadas pela comunidade local.
            Cada gesto faz diferença.
          </li>
        </ul>
      </div>

      <p className="info-footer-text">
        O objetivo é promover <strong>praias mais limpas</strong>, vendedores mais responsáveis
        e um verão verdadeiramente sustentável para toda a costa portuguesa.
      </p>
    </div>
  );
}
