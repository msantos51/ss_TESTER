import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiMapPin,
  FiArrowRight,
} from 'react-icons/fi';
import HomeMapPreview from '../components/HomeMapPreview';
import './Home.css';

// (em português) Página inicial / landing da Sunny Sales.
// Versão "Oceano / Editorial": fotografia de oceano turquesa em fundo,
// hero centrado com título gigante branco em caixa alta (estilo editorial
// de viagens), caixas brancas com texto preto e caixas pretas com texto
// branco. O header e o rodapé são geridos em App.jsx.

export default function Home() {
  return (
    <div className="home">
      {/* ══════════════ HERO COM MAPA ══════════════ */}
      <section className="home-hero home-hero-map">
        <HomeMapPreview />
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
