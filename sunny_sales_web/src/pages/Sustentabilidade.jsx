import React from 'react';
import { MdDelete, MdRecycling, MdWaves, MdCleaningServices, MdWbSunny, MdLocalDrink, MdPeople } from 'react-icons/md';
import BackHomeButton from '../components/BackHomeButton';
import './InfoPage.css';

export default function Sustentabilidade() {
  const items = [
    {
      icon: MdDelete,
      text: 'Recolher todo o lixo após a permanência na praia, incluindo beatas e plásticos pequenos muitas vezes esquecidos.'
    },
    {
      icon: MdCleaningServices,
      text: 'Utilizar cinzeiros portáteis para evitar a contaminação da areia e do mar.'
    },
    {
      icon: MdWbSunny,
      text: 'Preferir protetor solar com fórmulas de menor impacto nos ecossistemas marinhos e recifes de coral.'
    },
    {
      icon: MdLocalDrink,
      text: 'Evitar plásticos descartáveis e optar por garrafas, canecas e utensílios reutilizáveis.'
    },
    {
      icon: MdPeople,
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
          <MdDelete /> Emissões reduzidas
        </div>
        <div className="info-badge">
          <MdRecycling /> Embalagens eco-friendly
        </div>
        <div className="info-badge">
          <MdWaves /> Praias mais limpas
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
