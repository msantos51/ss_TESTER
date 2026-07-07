import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiMapPin, FiShield, FiArrowRight, FiCheckCircle, FiSmartphone,
  FiNavigation,
} from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa';
import './Home.css';

// (em português) Página inicial / landing com apresentação da Sunny Sales.
// Redesenhada com um visual de verão: hero de ecrã inteiro com gradiente
// oceano→pôr-do-sol, mockup do mapa e chamadas para ação. Os menus e as
// funcionalidades mantêm-se iguais — muda apenas o aspeto.
export default function Home() {
  return (
    <div className="home">
      {/* ── Hero (banda de ecrã inteiro) ─────────────────── */}
      <section className="home-hero">
        <div className="home-hero-inner">
          {/* Coluna de texto */}
          <div className="home-hero-content">
            <span className="home-hero-badge">
              <span className="home-hero-badge-dot" aria-hidden="true" />
              Em tempo real nas praias portuguesas
            </span>

            <h1 className="home-hero-title">
              O teu verão começa com os{' '}
              <span className="home-hero-accent">vendedores de praia</span>{' '}
              perto de ti
            </h1>

            <p className="home-hero-lead">
              A Sunny Sales liga banhistas e vendedores ambulantes através de um
              mapa interativo em tempo real. Apoia o comércio local e vive a
              praia com mais comodidade.
            </p>

            <div className="home-hero-actions">
              <Link to="/map" className="home-btn home-btn-primary">
                <FiMapPin size={18} />
                Ver no Mapa
                <FiArrowRight size={16} className="home-btn-arrow" aria-hidden="true" />
              </Link>
              <Link to="/como-funciona" className="home-btn home-btn-glass">
                Como Funciona
              </Link>
            </div>

            <ul className="home-hero-trust">
              <li><FiCheckCircle /> Vendedores verificados</li>
              <li><FiCheckCircle /> Sem custos para banhistas</li>
              <li><FiCheckCircle /> Web e mobile</li>
            </ul>
          </div>

          {/* Coluna visual: mockup do mapa + elementos de praia */}
          <div className="home-hero-visual" aria-hidden="true">
            <span className="hero-blob hero-blob-sun" />
            <div className="hero-phone">
              <span className="hero-phone-notch" />
              <div className="hero-phone-screen">
                <div className="hero-map">
                  <span className="hero-map-grid" />
                  <span className="hero-pin hero-pin-a"><FiMapPin size={13} /></span>
                  <span className="hero-pin hero-pin-b"><FiMapPin size={13} /></span>
                  <span className="hero-pin hero-pin-c"><FiMapPin size={13} /></span>
                  <span className="hero-me"><FiNavigation size={12} /></span>
                </div>
                <div className="hero-card">
                  <span className="hero-card-emoji">🍦</span>
                  <div className="hero-card-body">
                    <strong>Gelados do Zé</strong>
                    <span>a 120 m de ti · aberto</span>
                  </div>
                  <span className="hero-card-go"><FiArrowRight size={14} /></span>
                </div>
              </div>
            </div>

            <span className="hero-chip hero-chip-umbrella">⛱️</span>
            <span className="hero-chip hero-chip-drink">🥤</span>
            <span className="hero-chip hero-chip-palm">🌴</span>
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
