import React from 'react';
import {
  FiCompass, FiGrid, FiZap, FiMapPin, FiBarChart2,
  FiSmartphone, FiHeadphones,
} from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa';
import { TbCurrencyEuro } from 'react-icons/tb';
import InfoBanner from '../components/InfoBanner';
import './InfoPage.css';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=1000&q=80';

export default function HowItWorks() {
  return (
    <div className="info-page">

      <div className="info-hero info-hero--media">
        <div className="info-hero-content">
          <h1 className="info-hero-title">
            Como Funciona
          </h1>
          <p className="info-hero-lead">
            A <strong>Sunny Sales</strong> liga vendedores ambulantes a clientes nas praias
            através de um mapa em tempo real. Saiba como registar-se, gerir as suas rotas
            e acompanhar a sua atividade.
          </p>
        </div>

        <div className="info-hero-media">
          <img
            src={HERO_IMAGE}
            alt="Praia ao entardecer com o mar calmo"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
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
              Crie e personalize as suas rotas de venda nas praias onde pretende
              trabalhar.
            </div>
          </li>
          <li>
            <div className="info-timeline-number">3</div>
            <div className="info-timeline-body info-timeline-body-muted">
              Aceda à aplicação móvel e comece a vender nas suas rotas, partilhando a
              sua localização em tempo real.
            </div>
          </li>
          <li>
            <div className="info-timeline-number">4</div>
            <div className="info-timeline-body info-timeline-body-muted">
              Acompanhe as estatísticas das suas vendas e trajetos no painel de gestão.
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
            <div className="info-card-icon"><FiMapPin /></div>
            <h4 className="info-card-title">Rotas em Tempo Real</h4>
            <p className="info-card-text">
              Visualize as suas rotas no mapa interativo enquanto trabalha.
            </p>
          </div>

          <div className="info-card">
            <div className="info-card-icon"><FiBarChart2 /></div>
            <h4 className="info-card-title">Estatísticas e Relatórios</h4>
            <p className="info-card-text">
              Analise os dados das suas vendas e trajetos ao longo do tempo.
            </p>
          </div>

          <div className="info-card">
            <div className="info-card-icon"><TbCurrencyEuro /></div>
            <h4 className="info-card-title">Pagamentos Simples</h4>
            <p className="info-card-text">
              Subscrição paga de forma segura, sem comissões sobre as vendas.
            </p>
          </div>

          <div className="info-card">
            <div className="info-card-icon"><FiSmartphone /></div>
            <h4 className="info-card-title">Aplicação Móvel</h4>
            <p className="info-card-text">
              Aplicação simples de usar, pensada para o dia a dia na praia.
            </p>
          </div>

          <div className="info-card">
            <div className="info-card-icon"><FaLeaf /></div>
            <h4 className="info-card-title">Sustentabilidade</h4>
            <p className="info-card-text">
              Apoiamos o comércio local e iniciativas por praias mais limpas.
            </p>
          </div>

          <div className="info-card">
            <div className="info-card-icon"><FiHeadphones /></div>
            <h4 className="info-card-title">Suporte</h4>
            <p className="info-card-text">
              Equipa disponível para ajudar com qualquer dúvida ou problema técnico.
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
        Registe-se como vendedor e comece a usar a Sunny Sales no seu dia a dia
        na praia.
      </InfoBanner>
    </div>
  );
}
