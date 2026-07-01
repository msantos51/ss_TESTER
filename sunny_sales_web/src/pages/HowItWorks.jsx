import React from 'react';
import { FiCompass, FiGrid, FiZap } from 'react-icons/fi';
import BackHomeButton from '../components/BackHomeButton';
import InfoBanner from '../components/InfoBanner';
import './InfoPage.css';

export default function HowItWorks() {
  return (
    <div className="info-page">
      <BackHomeButton />

      <div className="info-hero">
        <h1 className="info-hero-title">
          Como <span>Funciona</span>
        </h1>
        <p className="info-hero-lead">
          A <strong>Sunny Sales</strong> conecta vendedores ambulantes com clientes nas praias
          através de uma plataforma inteligente que maximiza ganhos e oferece praticidade.
        </p>

        <div className="info-badges">
          <div className="info-badge info-badge-sky">Registo Simples</div>
          <div className="info-badge info-badge-sky">Gestão de Rotas</div>
          <div className="info-badge info-badge-sky">Relatórios em Tempo Real</div>
        </div>
      </div>

      <div className="info-section">
        <div className="info-section-head">
          <span className="info-section-icon">
            <FiCompass />
          </span>
          <h2 className="info-section-title">Passo a Passo</h2>
        </div>
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
        <div className="info-section-head">
          <span className="info-section-icon">
            <FiGrid />
          </span>
          <h2 className="info-section-title">Principais Funcionalidades</h2>
        </div>
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

      <InfoBanner
        icon={FiZap}
        title="Comece Agora"
        action={
          <a href="#/vendor-register" className="info-banner-btn">
            Registar como Vendedor
          </a>
        }
      >
        Junte-se aos nossos vendedores e transforme o seu negócio na praia com a
        plataforma mais inovadora do mercado.
      </InfoBanner>
    </div>
  );
}
