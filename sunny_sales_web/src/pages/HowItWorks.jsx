import React from 'react';
import BackHomeButton from '../components/BackHomeButton';
import './InfoPage.css';

export default function HowItWorks() {
  return (
    <div className="info-page">
      <BackHomeButton />

      <div className="info-hero">
        <h1 className="info-hero-title">Como Funciona</h1>
        <p className="info-hero-lead">
          A <strong>Sunny Sales</strong> conecta vendedores ambulantes com clientes nas praias
          através de uma plataforma inteligente que maximiza ganhos e oferece praticidade.
        </p>
      </div>

      <div className="info-badges">
        <div className="info-badge info-badge-sky">Registo Simples</div>
        <div className="info-badge info-badge-sky">Gestão de Rotas</div>
        <div className="info-badge info-badge-sky">Relatórios em Tempo Real</div>
      </div>

      <div className="info-section">
        <h3 className="info-section-title">Passo a Passo</h3>
        <ul className="info-timeline">
          <li>
            <div className="info-timeline-number">1</div>
            <div className="info-timeline-body info-timeline-body-muted">
              Registe-se como vendedor na plataforma e complete o seu perfil com as
              informações necessárias.
            </div>
          </li>
          <li>
            <div className="info-timeline-number">2</div>
            <div className="info-timeline-body info-timeline-body-muted">
              Crie e personalize suas rotas de venda nas praias onde deseja operar,
              escolhendo áreas estratégicas.
            </div>
          </li>
          <li>
            <div className="info-timeline-number">3</div>
            <div className="info-timeline-body info-timeline-body-muted">
              Acesse a aplicação mobile e comece a vender nas suas rotas com rastreamento
              de clientes em tempo real.
            </div>
          </li>
          <li>
            <div className="info-timeline-number">4</div>
            <div className="info-timeline-body info-timeline-body-muted">
              Acompanhe estatísticas detalhadas das suas vendas, ganhos e performance
              através do dashboard intuitivo.
            </div>
          </li>
        </ul>
      </div>

      <div className="info-section">
        <h3 className="info-section-title">Principais Funcionalidades</h3>
        <div className="info-cards">
          <div className="info-card">
            <div className="info-card-icon">📍</div>
            <h4 className="info-card-title">Rastreamento de Rotas</h4>
            <p className="info-card-text">
              Visualize suas rotas em tempo real com mapa interativo e dados de performance.
            </p>
          </div>

          <div className="info-card">
            <div className="info-card-icon">📊</div>
            <h4 className="info-card-title">Analytics e Relatórios</h4>
            <p className="info-card-text">
              Analise dados detalhados sobre suas vendas, lucros e comportamento de clientes.
            </p>
          </div>

          <div className="info-card">
            <div className="info-card-icon">💰</div>
            <h4 className="info-card-title">Pagamentos Simples</h4>
            <p className="info-card-text">
              Sistema seguro de pagamento com transferências rápidas e transparentes.
            </p>
          </div>

          <div className="info-card">
            <div className="info-card-icon">📱</div>
            <h4 className="info-card-title">App Mobile Intuitiva</h4>
            <p className="info-card-text">
              Aplicação fácil de usar, otimizada para dispositivos móveis com bateria eficiente.
            </p>
          </div>

          <div className="info-card">
            <div className="info-card-icon">🌍</div>
            <h4 className="info-card-title">Sustentabilidade</h4>
            <p className="info-card-text">
              Envolvido em iniciativas ambientais para praias mais limpas e um planeta melhor.
            </p>
          </div>

          <div className="info-card">
            <div className="info-card-icon">🤝</div>
            <h4 className="info-card-title">Suporte 24/7</h4>
            <p className="info-card-text">
              Equipa dedicada pronta para ajudar com qualquer dúvida ou problema técnico.
            </p>
          </div>
        </div>
      </div>

      <div className="info-cta">
        <h3 className="info-cta-title">Comece Agora</h3>
        <p className="info-cta-text">
          Junte-se aos nossos vendedores e transforme o seu negócio na praia com a plataforma
          mais inovadora do mercado.
        </p>
        <a href="#/vendor-register" className="info-cta-btn">
          Registar como Vendedor
        </a>
      </div>

      <p className="info-footer-text">
        Maximize seus ganhos com gestão inteligente de rotas, análise em tempo real e uma
        comunidade de vendedores profissionais. A Sunny Sales oferece a solução completa para
        o seu negócio nas praias.
      </p>
    </div>
  );
}
