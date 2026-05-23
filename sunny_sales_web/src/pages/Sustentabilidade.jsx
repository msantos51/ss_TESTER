import React from 'react';
import BackHomeButton from '../components/BackHomeButton';
import './InfoPage.css';

export default function Sustentabilidade() {
  return (
    <div className="info-page">
      <BackHomeButton />
      <h2 className="info-page-title">Sustentabilidade</h2>
      <p className="info-page-lead">
        Acreditamos que o futuro do comércio de praia deve ser mais{' '}
        <strong>eficiente, consciente e ecológico</strong>.
      </p>

      <div className="info-cards">
        <div className="info-card">
          <span className="info-card-icon">🌱</span>
          <h3 className="info-card-title">Redução da Pegada Ecológica</h3>
          <p className="info-card-text">
            A plataforma ajuda os vendedores a evitar deslocações desnecessárias,
            reduzindo o esforço físico e o impacto ambiental.
          </p>
        </div>

        <div className="info-card accent">
          <span className="info-card-icon">♻️</span>
          <h3 className="info-card-title">Embalagens Sustentáveis</h3>
          <p className="info-card-text">
            Incentivamos a utilização de sacos biodegradáveis, embalagens reutilizáveis
            e materiais amigos do ambiente.
          </p>
        </div>

        <div className="info-card">
          <span className="info-card-icon">🤝</span>
          <h3 className="info-card-title">Apoio a Campanhas</h3>
          <p className="info-card-text">
            Divulgamos e colaboramos com iniciativas de limpeza de praias, sensibilização
            ambiental e educação para a sustentabilidade.
          </p>
        </div>
      </div>

      <div className="info-section">
        <h3 className="info-section-title">Consciencialização dos Banhistas</h3>
        <ul className="info-list">
          <li data-bullet="✓">Recolher o lixo após a permanência na praia.</li>
          <li data-bullet="✓">Utilizar cinzeiros portáteis.</li>
          <li data-bullet="✓">Preferir protetor solar com menor impacto ambiental.</li>
        </ul>
      </div>

      <p className="info-footer-text">
        O objetivo é promover praias mais limpas, vendedores mais responsáveis e um verão sustentável.
      </p>
    </div>
  );
}
