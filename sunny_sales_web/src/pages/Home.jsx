import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiMapPin, FiClock, FiHeart, FiBell, FiShield, FiUsers,
  FiArrowRight, FiPlayCircle, FiSearch, FiCheckCircle, FiEye,
  FiStar, FiSmartphone,
} from 'react-icons/fi';
import { FaLeaf, FaUmbrellaBeach } from 'react-icons/fa';
import './Home.css';

// (em português) Página inicial / landing com apresentação da Sunny Sales.
// Estrutura: hero com fundo de praia (telemóvel + destaques), secção para
// vendedores com pré-visualização do mapa, cartão de estatísticas e uma
// fila final de funcionalidades.
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
              A Sunny Sales liga banhistas e vendedores ambulantes através de
              um mapa interativo em tempo real. Apoia o comércio local e vive
              a praia com mais comodidade!
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
                  <div className="home-stat-value">+500</div>
                  <div className="home-stat-label">Vendedores ativos</div>
                </div>
              </div>
              <div className="home-stat">
                <FiMapPin className="home-stat-icon" />
                <div>
                  <div className="home-stat-value">15+</div>
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

      {/* ── Vendedores + Números ─────────────────────────── */}
      <section className="home-mid">
        <div className="home-vendor-card">
          <div className="home-vendor-illustration" aria-hidden="true">
            <svg viewBox="0 0 220 190" role="img">
              {/* Guarda-sol */}
              <g>
                <line x1="118" y1="18" x2="96" y2="96" stroke="#c88a4b" strokeWidth="5" strokeLinecap="round" />
                <path d="M38 62 Q118 -30 198 62 Q158 44 118 62 Q78 44 38 62 Z" fill="#7ec8d6" />
                <path d="M78 47 Q118 -14 158 47 Q138 38 118 52 Q98 38 78 47 Z" fill="#f3f8f9" />
              </g>
              {/* Carrinho */}
              <g>
                <rect x="52" y="96" width="120" height="58" rx="10" fill="#8fd0dc" />
                <rect x="52" y="96" width="120" height="20" rx="10" fill="#f6fbfc" />
                <rect x="64" y="124" width="26" height="22" rx="4" fill="#f6fbfc" opacity="0.65" />
                <rect x="98" y="124" width="26" height="22" rx="4" fill="#f6fbfc" opacity="0.65" />
                <rect x="132" y="124" width="26" height="22" rx="4" fill="#f6fbfc" opacity="0.65" />
                {/* Garrafas em cima */}
                <rect x="70" y="78" width="11" height="20" rx="3" fill="#ee9b00" />
                <rect x="86" y="72" width="11" height="26" rx="3" fill="#e05252" />
                <rect x="102" y="80" width="11" height="18" rx="3" fill="#2d9e63" />
                {/* Rodas */}
                <circle cx="84" cy="162" r="13" fill="#25455c" />
                <circle cx="84" cy="162" r="5" fill="#f6fbfc" />
                <circle cx="146" cy="162" r="13" fill="#25455c" />
                <circle cx="146" cy="162" r="5" fill="#f6fbfc" />
              </g>
              {/* Chapéu de palha na areia */}
              <ellipse cx="196" cy="168" rx="18" ry="7" fill="#e9c87f" />
              <ellipse cx="196" cy="162" rx="10" ry="6" fill="#f2dfa8" />
            </svg>
          </div>

          <div className="home-vendor-body">
            <h2 className="home-vendor-title">És vendedor de praia?</h2>
            <p className="home-vendor-lead">
              Aumenta a tua visibilidade e chega a mais clientes todos os dias.
            </p>
            <ul className="home-vendor-list">
              <li><FiCheckCircle /> Mostra a tua localização em tempo real</li>
              <li><FiCheckCircle /> Gere os teus produtos e horários</li>
              <li><FiCheckCircle /> Recebe mais clientes na tua zona</li>
            </ul>
            <Link to="/planos" className="home-btn home-btn-teal">
              Saber mais para Vendedores
              <FiArrowRight size={16} />
            </Link>
          </div>

          <div className="home-vendor-map" aria-hidden="true">
            <span className="home-vendor-pin"><FiMapPin size={14} /></span>
            <div className="home-vendor-float">
              <div className="home-vendor-float-title">
                O teu negócio ao alcance de todos
              </div>
              <div className="home-vendor-avatars">
                <span className="home-vendor-avatar a1">MC</span>
                <span className="home-vendor-avatar a2">RP</span>
                <span className="home-vendor-avatar a3">AS</span>
                <span className="home-vendor-avatar more">+20</span>
              </div>
              <div className="home-vendor-float-text">
                Junta-te a mais de 500 vendedores que já usam a Sunny Sales
              </div>
            </div>
          </div>
        </div>

        <aside className="home-numbers">
          <h3 className="home-numbers-title">A Sunny Sales em números</h3>
          <div className="home-numbers-grid">
            <div className="home-number">
              <span className="home-number-icon"><FiUsers size={19} /></span>
              <div className="home-number-value">+500</div>
              <div className="home-number-label">Vendedores ativos</div>
            </div>
            <div className="home-number">
              <span className="home-number-icon"><FaUmbrellaBeach size={17} /></span>
              <div className="home-number-value">15+</div>
              <div className="home-number-label">Praias cobertas</div>
            </div>
            <div className="home-number">
              <span className="home-number-icon"><FiEye size={19} /></span>
              <div className="home-number-value">50K+</div>
              <div className="home-number-label">Utilizadores</div>
            </div>
            <div className="home-number">
              <span className="home-number-icon"><FiStar size={19} /></span>
              <div className="home-number-value">4.8</div>
              <div className="home-number-label">Avaliação média</div>
            </div>
          </div>
        </aside>
      </section>

      {/* ── Funcionalidades ──────────────────────────────── */}
      <section className="home-features">
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
      </section>
    </div>
  );
}
