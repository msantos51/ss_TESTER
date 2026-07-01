import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiMapPin, FiClock, FiHeart, FiBell, FiShield, FiUsers,
  FiArrowRight, FiPlayCircle, FiSearch, FiNavigation, FiChevronRight,
} from 'react-icons/fi';
import { FaLeaf } from 'react-icons/fa';
import './Home.css';

// (em português) Página inicial / landing com apresentação da Sunny Sales.
// Inspirada num layout de destaque: hero com telemóvel, estatísticas,
// pré-visualização do mapa e cartões de funcionalidades.
export default function Home() {
  return (
    <div className="home">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="home-hero-text">
            <span className="home-badge">
              <span className="home-badge-dot" />
              Em tempo real
            </span>

            <h1 className="home-hero-title">
              Encontra vendedores
              <br />
              <span className="accent">de praia perto de ti.</span>
            </h1>

            <p className="home-hero-lead">
              A Sunny Sales permite-te ver em tempo real onde estão os vendedores
              de praia. Apoia o comércio local e encontra o que precisas,
              sempre que precisas.
            </p>

            <div className="home-hero-actions">
              <Link to="/map" className="home-btn home-btn-primary">
                <FiMapPin size={18} />
                Ver no Mapa
              </Link>
              <Link to="/como-funciona" className="home-btn home-btn-ghost">
                <FiPlayCircle size={18} />
                Como Funciona
              </Link>
            </div>

            <div className="home-stats">
              <div className="home-stat">
                <FiUsers className="home-stat-icon" />
                <div>
                  <div className="home-stat-value">+320</div>
                  <div className="home-stat-label">Vendedores ativos</div>
                </div>
              </div>
              <div className="home-stat">
                <FiMapPin className="home-stat-icon" />
                <div>
                  <div className="home-stat-value">12</div>
                  <div className="home-stat-label">Praias</div>
                </div>
              </div>
              <div className="home-stat">
                <FiClock className="home-stat-icon" />
                <div>
                  <div className="home-stat-value">100%</div>
                  <div className="home-stat-label">Em tempo real</div>
                </div>
              </div>
            </div>
          </div>

          {/* Telemóvel ilustrativo */}
          <div className="home-hero-visual" aria-hidden="true">
            <div className="home-phone">
              <div className="home-phone-notch" />
              <div className="home-phone-screen">
                <div className="home-phone-header">
                  <span className="home-phone-brand">
                    <FiMapPin size={13} /> Sunny Sales
                  </span>
                </div>
                <div className="home-phone-search">
                  <FiSearch size={13} />
                  <span>Procurar praia ou vendedor</span>
                </div>
                <div className="home-phone-map">
                  <span className="phone-pin phone-pin-1"><FiMapPin size={12} /></span>
                  <span className="phone-pin phone-pin-2"><FiMapPin size={12} /></span>
                  <span className="phone-pin phone-pin-3"><FiMapPin size={12} /></span>
                  <span className="phone-pin phone-pin-me" />
                </div>
                <div className="home-phone-card">
                  <div className="home-phone-avatar">JT</div>
                  <div className="home-phone-card-body">
                    <div className="home-phone-card-name">João das Toalhas</div>
                    <div className="home-phone-card-sub">Praia de Carcavelos · 120 m</div>
                    <span className="home-phone-online">
                      <span className="home-phone-online-dot" /> Online agora
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Destaques laterais */}
          <div className="home-hero-side">
            <div className="home-highlight">
              <span className="home-highlight-icon sky"><FiClock size={20} /></span>
              <div>
                <div className="home-highlight-title">Localização em tempo real</div>
                <div className="home-highlight-text">Vê onde estão agora.</div>
              </div>
            </div>
            <div className="home-highlight">
              <span className="home-highlight-icon rose"><FiHeart size={20} /></span>
              <div>
                <div className="home-highlight-title">Apoia o comércio local</div>
                <div className="home-highlight-text">Valoriza quem trabalha na tua praia.</div>
              </div>
            </div>
            <div className="home-highlight">
              <span className="home-highlight-icon amber"><FiBell size={20} /></span>
              <div>
                <div className="home-highlight-title">Recebe alertas</div>
                <div className="home-highlight-text">
                  Sê notificado quando o teu vendedor favorito está perto.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Mapa em tempo real ───────────────────────────── */}
      <section className="home-map-section">
        <div className="home-map-info">
          <h2 className="home-map-title">Mapa em Tempo Real</h2>
          <div className="home-map-city">Lisboa</div>
          <p className="home-map-text">
            Vê todos os vendedores ativos nas praias de Lisboa.
          </p>
          <Link to="/map" className="home-btn home-btn-outline">
            <FiMapPin size={16} />
            Explorar Mapa Completo
          </Link>
        </div>

        <div className="home-map-preview" aria-hidden="true">
          <span className="home-map-live">
            <span className="home-map-live-dot" /> Atualizado agora
          </span>
          <div className="home-map-water" />
          <div className="home-map-land" />
          <span className="map-pin map-pin-a"><FiMapPin size={14} /></span>
          <span className="map-pin map-pin-b"><FiNavigation size={14} /></span>
          <span className="map-pin map-pin-c"><FiMapPin size={14} /></span>
          <span className="map-pin map-pin-d"><FiMapPin size={14} /></span>
          <span className="map-label map-label-a">Praia de Carcavelos</span>
          <span className="map-label map-label-b">Praia da Torre</span>
          <span className="map-label map-label-c">Praia da Conceição</span>
        </div>
      </section>

      {/* ── Cartões de funcionalidades ───────────────────── */}
      <section className="home-features">
        <Link to="/como-funciona" className="home-feature">
          <span className="home-feature-icon sky"><FiUsers size={22} /></span>
          <h3 className="home-feature-title">Para Vendedores</h3>
          <p className="home-feature-text">
            Junta-te à plataforma e chega a mais clientes na tua zona.
          </p>
          <span className="home-feature-link">Saber mais <FiArrowRight size={14} /></span>
        </Link>

        <Link to="/faqs" className="home-feature">
          <span className="home-feature-icon amber"><FiShield size={22} /></span>
          <h3 className="home-feature-title">Confiança e Segurança</h3>
          <p className="home-feature-text">
            Todos os vendedores são verificados para garantir a tua segurança.
          </p>
          <span className="home-feature-link">Saber mais <FiArrowRight size={14} /></span>
        </Link>

        <Link to="/sustentabilidade" className="home-feature">
          <span className="home-feature-icon green"><FaLeaf size={20} /></span>
          <h3 className="home-feature-title">Sustentabilidade</h3>
          <p className="home-feature-text">
            Promovemos práticas sustentáveis nas nossas praias.
          </p>
          <span className="home-feature-link">Saber mais <FiArrowRight size={14} /></span>
        </Link>
      </section>

      {/* ── CTA final ────────────────────────────────────── */}
      <section className="home-cta">
        <div className="home-cta-inner">
          <h2 className="home-cta-title">Pronto para encontrar o teu vendedor?</h2>
          <p className="home-cta-text">
            Abre o mapa e descobre quem está na tua praia neste momento.
          </p>
          <Link to="/map" className="home-btn home-btn-primary home-btn-lg">
            Explorar Mapa <FiChevronRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  );
}
