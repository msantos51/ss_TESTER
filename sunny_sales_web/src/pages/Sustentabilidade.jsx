import React from 'react';
import BackHomeButton from '../components/BackHomeButton';
import './InfoPage.css';

export default function Sustentabilidade() {
  return (
    <div className="info-page">
      <BackHomeButton />

      <div className="info-hero green">
        <span className="info-hero-icon">🌿</span>
        <h1 className="info-hero-title">Sustentabilidade</h1>
        <p className="info-hero-lead">
          Acreditamos que o futuro do comércio de praia deve ser mais{' '}
          <strong>eficiente, consciente e ecológico</strong>. Cada decisão conta para
          um litoral mais saudável e praias mais limpas.
        </p>
      </div>

      <div className="info-badges">
        <div className="info-badge">
          <span className="info-badge-value">🌱</span> Emissões reduzidas
        </div>
        <div className="info-badge">
          <span className="info-badge-value">♻️</span> Embalagens eco-friendly
        </div>
        <div className="info-badge">
          <span className="info-badge-value">🌊</span> Praias mais limpas
        </div>
      </div>

      <div className="info-cards">
        <div className="info-card">
          <span className="info-card-icon">🌱</span>
          <h3 className="info-card-title">Redução da Pegada Ecológica</h3>
          <p className="info-card-text">
            Ao otimizar os percursos dos vendedores com base na localização real dos clientes,
            reduzimos as deslocações desnecessárias, diminuindo o esforço físico e o impacto
            ambiental de cada jornada de trabalho.
          </p>
        </div>

        <div className="info-card accent">
          <span className="info-card-icon">♻️</span>
          <h3 className="info-card-title">Embalagens Sustentáveis</h3>
          <p className="info-card-text">
            Incentivamos ativamente os vendedores parceiros a utilizarem sacos biodegradáveis,
            embalagens reutilizáveis e materiais amigos do ambiente. A plataforma destaca os
            vendedores com práticas sustentáveis certificadas.
          </p>
        </div>

        <div className="info-card">
          <span className="info-card-icon">🤝</span>
          <h3 className="info-card-title">Apoio a Campanhas</h3>
          <p className="info-card-text">
            Divulgamos e colaboramos com iniciativas de limpeza de praias, sensibilização
            ambiental e educação para a sustentabilidade. Juntos, construímos praias
            melhores para as gerações futuras.
          </p>
        </div>
      </div>

      <div className="info-section">
        <h3 className="info-section-title">Consciencialização dos Banhistas</h3>
        <ul className="info-list">
          <li data-bullet="✓">
            Recolher todo o lixo após a permanência na praia — incluindo beatas e plásticos
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
            Participar em ações de limpeza de praia organizadas pela comunidade local —
            cada gesto faz diferença.
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
