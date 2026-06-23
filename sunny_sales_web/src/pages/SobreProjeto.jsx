import React from 'react';
import BackHomeButton from '../components/BackHomeButton';
import './InfoPage.css';

export default function SobreProjeto() {
  return (
    <div className="info-page">
      <BackHomeButton />

      <div className="info-hero">
        <h1 className="info-hero-title">Sobre o Projeto</h1>
        <p className="info-hero-lead">
          O <strong>Sunny Sales</strong> conecta vendedores ambulantes de praia a banhistas
          através de um mapa interativo em tempo real, unindo tradição, tecnologia e
          sustentabilidade nas praias portuguesas.
        </p>
      </div>

      <div className="info-badges">
        <div className="info-badge">Praias portuguesas</div>
        <div className="info-badge">Localização em tempo real</div>
        <div className="info-badge">Web &amp; Mobile</div>
      </div>

      <div className="info-section">
        <h3 className="info-section-title">Como Funciona</h3>
        <ul className="info-timeline">
          <li>
            <div className="info-timeline-number">1</div>
            <div className="info-timeline-body blue-text">
              O vendedor abre a aplicação e ativa a localização, ficando imediatamente visível
              no mapa para todos os banhistas nas proximidades.
            </div>
          </li>
          <li>
            <div className="info-timeline-number">2</div>
            <div className="info-timeline-body blue-text">
              O banhista acede ao mapa, filtra por tipo de produto e vê os vendedores mais
              próximos em tempo real.
            </div>
          </li>
          <li>
            <div className="info-timeline-number">3</div>
            <div className="info-timeline-body blue-text">
              O vendedor passa e o banhista recebe o produto sem ter de se levantar, de forma
              prática e eficiente para ambos.
            </div>
          </li>
        </ul>
      </div>

      <p className="info-footer-text">
        O Sunny Sales promove praticidade, sustentabilidade e a valorização do comércio local
        nas praias portuguesas.
      </p>
    </div>
  );
}
