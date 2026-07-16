import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiMapPin,
  FiArrowRight,
  FiSmartphone,
  FiZap,
} from 'react-icons/fi';
import './Home.css';

// (em português) Página inicial / landing da Sunny Sales.
// Versão "Dark Sport/Premium": fundo azul-petróleo/carvão muito escuro,
// tipografia bold e acento vermelho-alaranjado nos CTAs e detalhes.
// O header e o rodapé são geridos em App.jsx.

export default function Home() {
  return (
    <div className="home">
      {/* ══════════════ HERO ══════════════ */}
      <section className="home-hero">
        <div className="home-hero-inner">
          {/* Coluna do texto */}
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
              a poucos passos de ti — sem sair da toalha.
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

            <div className="hero-facts">
              <span><FiZap size={13} /> Em tempo real</span>
              <i aria-hidden="true" />
              <span><FiMapPin size={13} /> Praias de Portugal</span>
              <i aria-hidden="true" />
              <span><FiSmartphone size={13} /> Sem instalar app</span>
            </div>
          </div>

          {/* Coluna do mapa (estático, sem animação) */}
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-map">
              <div className="hero-map-live">
                <span className="hero-map-live-dot" />
                12 vendedores ativos
              </div>

              <span className="hero-pin" style={{ top: '34%', left: '28%' }} />
              <span className="hero-pin hero-pin--accent" style={{ top: '52%', left: '64%' }} />
              <span className="hero-pin" style={{ top: '68%', left: '40%' }} />
              <span className="hero-me" style={{ top: '78%', left: '54%' }} />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
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

      {/* ══════════════ CTA FINAL ══════════════ */}
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
