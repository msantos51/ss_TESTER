import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiMapPin, FiShield, FiArrowRight, FiCheckCircle, FiSmartphone,
  FiNavigation,
} from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa';
import './Home.css';

// (em português) Página inicial / landing com apresentação da Sunny Sales.
// Hero de ecrã inteiro com fundo de sol (amarelo→âmbar) e o mockup do site
// dentro de um telemóvel ao centro. O header fica sem fundo por cima do hero
// (tratado em App.jsx). Os menus e as funcionalidades mantêm-se iguais.
export default function Home() {
  return (
    <div className="home">
      {/* ── Hero (ecrã de sol) ───────────────────────────── */}
      <section className="home-hero">
        {/* Fundo: raios de sol + brilho quente (evocam o splash) */}
        <span className="hero-rays" aria-hidden="true" />
        <span className="hero-sun" aria-hidden="true" />

        <div className="home-hero-inner">
          <span className="home-hero-badge">
            <span className="home-hero-badge-dot" aria-hidden="true" />
            Em tempo real nas praias portuguesas
          </span>

          <h1 className="home-hero-title">
            Os <span className="home-hero-accent">vendedores de praia</span>{' '}
            perto de ti, em tempo real
          </h1>

          {/* Mockup do site dentro de um telemóvel */}
          <div className="hero-phone" aria-hidden="true">
            <span className="hero-phone-notch" />
            <div className="hero-phone-screen">
              <div className="ps-bar">
                <span className="ps-logo">Sunny Sales</span>
                <span className="ps-burger"><i /><i /><i /></span>
              </div>
              <div className="ps-hero">
                <span className="ps-tag">Praia · tempo real</span>
                <strong className="ps-title">Vendedores perto de ti</strong>
                <span className="ps-cta">Ver no Mapa</span>
              </div>
              <div className="ps-map">
                <span className="ps-grid" />
                <span className="ps-pin ps-pin-a"><FiMapPin size={11} /></span>
                <span className="ps-pin ps-pin-b"><FiMapPin size={11} /></span>
                <span className="ps-pin ps-pin-c"><FiMapPin size={11} /></span>
                <span className="ps-me"><FiNavigation size={10} /></span>
              </div>
              <div className="ps-card">
                <span className="ps-card-emoji">🍦</span>
                <div className="ps-card-body">
                  <strong>Gelados do Zé</strong>
                  <span>a 120 m · aberto</span>
                </div>
                <span className="ps-card-go"><FiArrowRight size={12} /></span>
              </div>
            </div>
          </div>

          {/* Trio de botões */}
          <div className="hero-cta-row">
            <Link to="/map" className="hero-pill hero-pill-primary">
              <FiMapPin size={16} />
              Explorar Mapa
            </Link>
            <Link to="/como-funciona" className="hero-pill">
              Como Funciona
            </Link>
            <Link to="/planos" className="hero-pill">
              Para Vendedores
            </Link>
          </div>
        </div>
      </section>

      {/* ── Funcionalidades ──────────────────────────────── */}
      <section className="home-section home-features-section">
        <p className="home-kicker">Porquê a Sunny Sales</p>
        <h2 className="home-section-title">
          Tudo o que precisas para viver a praia
        </h2>

        <div className="home-features">
          <Link to="/map" className="home-feature">
            <span className="home-feature-icon"><FiMapPin size={20} /></span>
            <div>
              <h3 className="home-feature-title">Mapa Interativo</h3>
              <p className="home-feature-text">
                Explora o mapa e encontra vendedores perto de ti.
              </p>
            </div>
          </Link>

          <Link to="/faqs" className="home-feature">
            <span className="home-feature-icon"><FiShield size={20} /></span>
            <div>
              <h3 className="home-feature-title">Seguro e Confiável</h3>
              <p className="home-feature-text">
                Todos os vendedores são verificados para garantir a tua segurança.
              </p>
            </div>
          </Link>

          <Link to="/sustentabilidade" className="home-feature">
            <span className="home-feature-icon"><FaLeaf size={18} /></span>
            <div>
              <h3 className="home-feature-title">Sustentável</h3>
              <p className="home-feature-text">
                Promovemos o comércio local e práticas sustentáveis.
              </p>
            </div>
          </Link>

          <Link to="/como-funciona" className="home-feature">
            <span className="home-feature-icon"><FiSmartphone size={20} /></span>
            <div>
              <h3 className="home-feature-title">Sempre Contigo</h3>
              <p className="home-feature-text">
                Disponível na web e em mobile, onde estiveres.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Vendedores ───────────────────────────────────── */}
      <section className="home-section home-mid">
        <div className="home-vendor-card">
          <div className="home-vendor-body">
            <p className="home-kicker home-kicker-light">Para vendedores</p>
            <h2 className="home-vendor-title">És vendedor de praia?</h2>
            <p className="home-vendor-lead">
              Aumenta a tua visibilidade e chega a mais clientes todos os dias.
            </p>
            <ul className="home-vendor-list">
              <li><FiCheckCircle /> Mostra a tua localização em tempo real</li>
              <li><FiCheckCircle /> Gere os teus produtos e horários</li>
              <li><FiCheckCircle /> Recebe mais clientes na tua zona</li>
            </ul>
            <Link to="/planos" className="home-btn home-btn-light">
              Saber mais para Vendedores
              <FiArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
