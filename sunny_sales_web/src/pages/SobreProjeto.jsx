import React from 'react';
import BackHomeButton from '../components/BackHomeButton';
import './InfoPage.css';

export default function SobreProjeto() {
  return (
    <div className="info-page">
      <BackHomeButton />
      <h2 className="info-page-title">Sobre o Projeto</h2>
      <p className="info-page-lead">
        O <strong>Sunny Sales</strong> conecta vendedores ambulantes de praia a banhistas
        através de um mapa interativo em tempo real.
      </p>

      <div className="info-cards">
        <div className="info-card accent">
          <span className="info-card-icon">🏖️</span>
          <h3 className="info-card-title">Quem Somos</h3>
          <p className="info-card-text">
            Conectamos vendedores ambulantes (bolas de Berlim, gelados, acessórios) a
            banhistas integrando tradição e tecnologia para valorizar o comércio local.
          </p>
        </div>

        <div className="info-card">
          <span className="info-card-icon">💡</span>
          <h3 className="info-card-title">Motivação</h3>
          <p className="info-card-text">
            Os consumidores têm dificuldade em encontrar vendedores. O Sunny Sales mostra
            os vendedores mais próximos, os produtos disponíveis e simplifica a experiência
            na praia.
          </p>
        </div>

        <div className="info-card">
          <span className="info-card-icon">✅</span>
          <h3 className="info-card-title">Benefícios</h3>
          <ul className="info-card-list">
            <li>Evita procurar vendedores pela praia.</li>
            <li>Direciona vendedores ao público interessado.</li>
            <li>Promove organização e sustentabilidade balnear.</li>
          </ul>
        </div>
      </div>

      <p className="info-footer-text">
        O Sunny Sales promove praticidade, sustentabilidade e a valorização do comércio local.
      </p>
    </div>
  );
}
