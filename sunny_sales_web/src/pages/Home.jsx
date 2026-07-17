import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiMapPin,
  FiArrowRight,
  FiChevronDown,
} from 'react-icons/fi';
import './Home.css';

// (em português) Página inicial / landing da Sunny Sales.
// Versão "Oceano / Editorial": fotografia de oceano turquesa em fundo,
// hero centrado com título gigante branco em caixa alta (estilo editorial
// de viagens), caixas brancas com texto preto e caixas pretas com texto
// branco. O header e o rodapé são geridos em App.jsx.

export default function Home() {
  return (
    <div className="home">
      {/* ══════════════ HERO ══════════════ */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <span className="home-hero-eyebrow">
            Vendedores de praia em tempo real
          </span>

          <h1 className="home-hero-title">
            Sunny Sales
          </h1>

          <p className="home-hero-lead">
            Gelados, bebidas e bolas de Berlim a poucos passos da tua
            toalha — descobre quem está a vender na tua praia, sem
            instalar nada.
          </p>

          <div className="hero-actions">
            <Link to="/map" className="hero-pill hero-pill-primary">
              <FiMapPin size={18} />
              Explorar Mapa
            </Link>
            <Link to="/como-funciona" className="hero-pill hero-pill-ghost">
              Como funciona
              <FiArrowRight size={16} />
            </Link>
          </div>
        </div>

        <div className="home-hero-scroll" aria-hidden="true">
          <FiChevronDown size={22} />
        </div>
      </section>

      {/* ══════════════ STATS — caixas brancas ══════════════ */}
      <section className="home-section">
        <div className="home-stats reveal">
          <div className="home-stat">
            <span className="home-stat-num">Tempo real</span>
            <span className="home-stat-label">Localização via GPS</span>
          </div>
          <div className="home-stat">
            <span className="home-stat-num">0€</span>
            <span className="home-stat-label">Para banhistas, sempre</span>
          </div>
          <div className="home-stat">
            <span className="home-stat-num">Sem app</span>
            <span className="home-stat-label">Abre e usa no browser</span>
          </div>
          <div className="home-stat">
            <span className="home-stat-num">PT</span>
            <span className="home-stat-label">Praias portuguesas</span>
          </div>
        </div>
      </section>

      {/* ══════════════ CTA FINAL — caixa preta ══════════════ */}
      <section className="home-section">
        <div className="home-final reveal">
          <h2 className="home-final-title">Pronto para o teu próximo mergulho?</h2>
          <p className="home-final-text">
            Descobre quem está a vender na tua praia — agora mesmo.
          </p>
          <Link to="/map" className="hero-pill hero-pill-primary hero-pill-lg">
            <FiMapPin size={18} />
            Explorar Mapa
          </Link>
        </div>
      </section>
    </div>
  );
}
