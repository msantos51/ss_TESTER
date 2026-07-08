import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiArrowRight, FiNavigation } from 'react-icons/fi';
import './Home.css';

// (em português) Página inicial / landing da Sunny Sales.
// Um único ecrã (hero): à esquerda o texto e o botão "Explorar Mapa";
// à direita o mockup do site dentro de um telemóvel, com um brilho de sol
// por trás. Sem secções adicionais — apenas o hero. O header e o rodapé
// são geridos em App.jsx.
export default function Home() {
  return (
    <div className="home">
      <section className="home-hero">
        {/* Fundo: raios de sol + brilho quente por trás do telemóvel */}
        <span className="hero-rays" aria-hidden="true" />
        <span className="hero-sun" aria-hidden="true" />

        <div className="home-hero-inner">
          {/* ── Coluna do texto ─────────────────────────────── */}
          <div className="hero-copy">
            <span className="home-hero-badge">
              <span className="home-hero-badge-dot" aria-hidden="true" />
              Em tempo real nas praias portuguesas
            </span>

            <h1 className="home-hero-title">
              Os vendedores de praia perto de ti,{' '}
              <span className="home-hero-accent">em tempo real</span>
            </h1>

            <p className="home-hero-lead">
              Encontra gelados, bebidas, bolas de Berlim e muito mais,
              a poucos passos de ti.
            </p>

            <Link to="/map" className="hero-pill hero-pill-primary">
              <FiMapPin size={16} />
              Explorar Mapa
            </Link>
          </div>

          {/* ── Coluna do telemóvel (mockup do site) ────────── */}
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
        </div>
      </section>
    </div>
  );
}
