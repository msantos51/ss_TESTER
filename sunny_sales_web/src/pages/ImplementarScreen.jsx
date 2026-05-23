import React from 'react';
import BackHomeButton from '../components/BackHomeButton';
import './InfoPage.css';

export default function ImplementarScreen() {
  return (
    <div className="info-page">
      <BackHomeButton />
      <h2 className="info-page-title">Implementação do Sunny Sales</h2>
      <p className="info-page-lead">
        Uma solução tecnológica para <strong>autarquias, juntas de freguesia e entidades
        gestoras do litoral</strong> que pretendem modernizar a experiência balnear.
      </p>

      <div className="info-cards">
        <div className="info-card accent">
          <span className="info-card-icon">🏛️</span>
          <h3 className="info-card-title">Vantagens para a Autarquia</h3>
          <ul className="info-card-list">
            <li>Organização da atividade ambulante.</li>
            <li>Promoção do comércio local e sustentável.</li>
            <li>Melhoria da experiência dos veraneantes.</li>
            <li>Redução da circulação desnecessária.</li>
            <li>Reforço da imagem de inovação.</li>
          </ul>
        </div>

        <div className="info-card">
          <span className="info-card-icon">🗺️</span>
          <h3 className="info-card-title">Recursos Disponibilizados</h3>
          <ul className="info-card-list">
            <li>Mapa digital com vendedores em tempo real.</li>
            <li>Filtros por tipo de produto.</li>
            <li>Acesso via QR Code.</li>
            <li>Página personalizada por localidade.</li>
            <li>Estatísticas de utilização.</li>
          </ul>
        </div>
      </div>

      <div className="info-section">
        <h3 className="info-section-title">Processo de Implementação</h3>
        <ul className="info-list">
          <li data-bullet="1">Envie um e-mail para <strong>suporte@sunnysales.com</strong>.</li>
          <li data-bullet="2">Agendaremos uma demonstração breve, presencial ou online.</li>
          <li data-bullet="3">Em poucos dias, a praia pode ser integrada no sistema.</li>
        </ul>
      </div>

      <p className="info-footer-text">
        <strong>Estamos disponíveis para parcerias, protocolos institucionais e ações conjuntas.</strong>
        <br />Participe na transformação digital das praias portuguesas.
      </p>
    </div>
  );
}
