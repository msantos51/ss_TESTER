import React from 'react';
import { Link } from 'react-router-dom';
import { FiMapPin, FiArrowRight } from 'react-icons/fi';
import './Home.css';

// (em português) Página inicial / landing da Sunny Sales.
// Um único ecrã (hero) sobre fundo amarelo, com todo o conteúdo
// centrado: o texto e o botão "Explorar Mapa". Sem secções
// adicionais — apenas o hero. O header e o rodapé são geridos
// em App.jsx.
export default function Home() {
  return (
    <div className="home">
      <section className="home-hero">
        <div className="home-hero-inner">
          {/* ── Conteúdo centrado ───────────────────────────── */}
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

            <div className="hero-actions">
              <Link to="/map" className="hero-pill hero-pill-primary">
                <FiMapPin size={16} />
                Explorar Mapa
              </Link>
              <Link to="/como-funciona" className="hero-textlink">
                Como funciona
                <FiArrowRight size={15} />
              </Link>
            </div>

            <div className="hero-facts">
              <span>Em tempo real</span>
              <i aria-hidden="true" />
              <span>Praias de Portugal</span>
              <i aria-hidden="true" />
              <span>Sem instalar app</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
