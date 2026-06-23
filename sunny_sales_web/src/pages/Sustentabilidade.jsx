import React from 'react';
import BackHomeButton from '../components/BackHomeButton';
import './InfoPage.css';

const TrashIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-4 0v12m-6-12l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RecycleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12c0 1.05-.3 2.05-.84 2.89M12 21c-2.36 0-4.5-1.16-5.81-2.93M3.12 10.11c.02-.41.12-.81.28-1.18M20.9 8.1c-.32-1.06-.95-2.02-1.8-2.74L10 2.5m-6.15 7.08c.36-.47.8-.88 1.3-1.22M6.1 14.38c.31.52.78.97 1.35 1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const WaveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M2 10c5.5-1 7-1 10-1s4.5 0 10 1M2 15c5.5-1 7-1 10-1s4.5 0 10 1M2 20c5.5-1 7-1 10-1s4.5 0 10 1" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BroomIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="6" cy="18" r="3"/><path d="M18 6l-6 6m0 0l-6 6M18 6l-6-6m6 6l6 6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/><path d="M12 1v6m0 6v6M4.22 4.22l4.24 4.24m6.08 0l4.24-4.24M1 12h6m6 0h6M4.22 19.78l4.24-4.24m6.08 0l4.24 4.24" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BottleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M9 3h6v2h1V3h-1c0-1.1-.9-2-2-2h-2c-1.1 0-2 .9-2 2M8 5h8v14c0 1.1-.9 2-2 2h-4c-1.1 0-2-.9-2-2V5m2 3h4m-2-2v2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const PeopleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm8 6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default function Sustentabilidade() {
  const items = [
    {
      icon: TrashIcon,
      text: 'Recolher todo o lixo após a permanência na praia, incluindo beatas e plásticos pequenos muitas vezes esquecidos.'
    },
    {
      icon: BroomIcon,
      text: 'Utilizar cinzeiros portáteis para evitar a contaminação da areia e do mar.'
    },
    {
      icon: SunIcon,
      text: 'Preferir protetor solar com fórmulas de menor impacto nos ecossistemas marinhos e recifes de coral.'
    },
    {
      icon: BottleIcon,
      text: 'Evitar plásticos descartáveis e optar por garrafas, canecas e utensílios reutilizáveis.'
    },
    {
      icon: PeopleIcon,
      text: 'Participar em ações de limpeza de praia organizadas pela comunidade local. Cada gesto faz diferença.'
    }
  ];

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
        <div className="info-badge">
          <TrashIcon /> Emissões reduzidas
        </div>
        <div className="info-badge">
          <RecycleIcon /> Embalagens eco-friendly
        </div>
        <div className="info-badge">
          <WaveIcon /> Praias mais limpas
        </div>
      </div>

      <div className="info-section">
        <h3 className="info-section-title">Consciencialização dos Banhistas</h3>
        <ul className="sustainability-list">
          {items.map((item, index) => (
            <li key={index} className="sustainability-item">
              <span className="sustainability-icon">
                <item.icon />
              </span>
              <span className="sustainability-text">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="sustainability-cta">
        <div className="sustainability-cta-icon">🌊</div>
        <p className="sustainability-cta-text">
          O objetivo é promover <strong>praias mais limpas</strong>, vendedores mais responsáveis
          e um verão verdadeiramente sustentável para toda a costa portuguesa.
        </p>
      </div>
    </div>
  );
}
