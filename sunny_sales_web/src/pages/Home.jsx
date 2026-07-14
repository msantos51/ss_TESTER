import React from 'react';
import { Link } from 'react-router-dom';
import {
  FiMapPin,
  FiArrowRight,
  FiClock,
  FiFilter,
  FiSmartphone,
  FiNavigation,
  FiTrendingUp,
  FiHeart,
  FiZap,
  FiUsers,
} from 'react-icons/fi';
import './Home.css';

// (em português) Página inicial / landing da Sunny Sales.
// Um hero solar e dinâmico com um mapa "ao vivo", seguido de secções
// que revelam ao rolar: como funciona, funcionalidades, categorias de
// produtos e chamadas à ação. O header e o rodapé são geridos em App.jsx.

const STEPS = [
  {
    icon: FiMapPin,
    title: 'Abre o mapa',
    text: 'Sem instalar nada. Abre o mapa e vê quem está a vender perto de ti, agora mesmo.',
  },
  {
    icon: FiFilter,
    title: 'Filtra o que queres',
    text: 'Bolas de Berlim, gelados, bebidas… filtra por produto e por distância.',
  },
  {
    icon: FiZap,
    title: 'Recebe sem te levantares',
    text: 'Vês o vendedor a aproximar-se em tempo real. É só acenar quando passar.',
  },
];

const FEATURES = [
  {
    icon: FiClock,
    title: 'Tempo real',
    text: 'Posições atualizadas ao segundo via GPS. O que vês é onde eles estão.',
  },
  {
    icon: FiFilter,
    title: 'Filtros inteligentes',
    text: 'Escolhe o produto e a distância máxima. Só te mostramos o que interessa.',
  },
  {
    icon: FiNavigation,
    title: 'Mapa que roda contigo',
    text: 'O mapa acompanha a orientação do teu telemóvel para te guiar melhor.',
  },
  {
    icon: FiSmartphone,
    title: 'Sem instalar app',
    text: 'Funciona direto no browser. Abre o link e está tudo pronto.',
  },
  {
    icon: FiUsers,
    title: 'Perfis de vendedor',
    text: 'Foto, produto e stories de cada vendedor para saberes a quem compras.',
  },
  {
    icon: FiHeart,
    title: 'Praia sustentável',
    text: 'Apoiamos o comércio local e praias mais limpas, a cada venda.',
  },
];

const CATEGORIES = [
  { emoji: '🍩', label: 'Bolas de Berlim' },
  { emoji: '🍦', label: 'Gelados' },
  { emoji: '🥤', label: 'Bebidas frescas' },
  { emoji: '🍉', label: 'Fruta' },
  { emoji: '🏖️', label: 'Acessórios' },
  { emoji: '🥥', label: 'E muito mais' },
];

const MARQUEE = [
  'Gelados', 'Bolas de Berlim', 'Bebidas frescas', 'Fruta da época',
  'Acessórios de praia', 'Água fresca', 'Snacks',
];

export default function Home() {
  return (
    <div className="home">
      {/* ══════════════ HERO ══════════════ */}
      <section className="home-hero">
        <div className="home-hero-bg" aria-hidden="true">
          <span className="hero-sun" />
          <span className="hero-orb hero-orb-1" />
          <span className="hero-orb hero-orb-2" />
          <span className="hero-orb hero-orb-3" />
          <span className="hero-grid" />
        </div>

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
              <Link to="/como-funciona" className="hero-textlink">
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

          {/* Coluna do mapa "ao vivo" */}
          <div className="hero-visual" aria-hidden="true">
            <div className="hero-map">
              <div className="hero-map-live">
                <span className="hero-map-live-dot" />
                12 vendedores ativos
              </div>

              <span className="hero-route" />

              {/* Pins de vendedores */}
              <span className="hero-pin hero-pin--gold" style={{ top: '58%', left: '30%' }}>
                <span className="hero-pin-emoji">🍩</span>
              </span>
              <span className="hero-pin hero-pin--coral" style={{ top: '72%', left: '58%' }}>
                <span className="hero-pin-emoji">🍦</span>
              </span>
              <span className="hero-pin hero-pin--teal" style={{ top: '46%', left: '68%' }}>
                <span className="hero-pin-emoji">🥤</span>
              </span>

              {/* "Estás aqui" */}
              <span className="hero-me" style={{ top: '80%', left: '40%' }}>
                <span className="hero-me-ring" />
              </span>

              {/* Chips flutuantes */}
              <div className="hero-chip hero-chip-1">
                <span className="hero-chip-emoji">🍩</span>
                <div>
                  <strong>Bolas de Berlim</strong>
                  <em>a 40 m de ti</em>
                </div>
              </div>
              <div className="hero-chip hero-chip-2">
                <span className="hero-chip-emoji">🍦</span>
                <div>
                  <strong>Gelados</strong>
                  <em>a chegar</em>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Faixa deslizante de produtos */}
        <div className="hero-marquee" aria-hidden="true">
          <div className="hero-marquee-track">
            {[...MARQUEE, ...MARQUEE].map((item, i) => (
              <span key={i} className="hero-marquee-item">
                {item}
                <i />
              </span>
            ))}
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
            <span className="home-stat-num">🇵🇹</span>
            <span className="home-stat-label">Praias portuguesas</span>
          </div>
        </div>
      </section>

      {/* ══════════════ COMO FUNCIONA ══════════════ */}
      <section className="home-section">
        <header className="home-head reveal">
          <span className="home-eyebrow">Como funciona</span>
          <h2 className="home-title">Do teu lugar à areia, em três passos</h2>
          <p className="home-sub">
            Simples para os banhistas, poderoso para os vendedores.
          </p>
        </header>

        <div className="home-steps">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <article
                key={step.title}
                className={`step-card reveal reveal-d${i + 1}`}
              >
                <span className="step-num">{i + 1}</span>
                <span className="step-icon"><Icon size={22} /></span>
                <h3 className="step-title">{step.title}</h3>
                <p className="step-text">{step.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ══════════════ FUNCIONALIDADES ══════════════ */}
      <section className="home-section">
        <header className="home-head reveal">
          <span className="home-eyebrow">Feito para a praia</span>
          <h2 className="home-title">Tudo o que precisas, num só mapa</h2>
        </header>

        <div className="home-features">
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <article
                key={f.title}
                className={`feature-card reveal reveal-d${(i % 3) + 1}`}
              >
                <span className="feature-icon"><Icon size={20} /></span>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-text">{f.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      {/* ══════════════ CATEGORIAS ══════════════ */}
      <section className="home-section">
        <header className="home-head reveal">
          <span className="home-eyebrow">O que encontras</span>
          <h2 className="home-title">Fresquinho, a poucos passos</h2>
        </header>

        <div className="home-cats">
          {CATEGORIES.map((c, i) => (
            <div
              key={c.label}
              className={`cat-chip reveal reveal-d${(i % 5) + 1}`}
            >
              <span className="cat-emoji">{c.emoji}</span>
              <span className="cat-label">{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════ CTA VENDEDORES (escuro) ══════════════ */}
      <section className="home-section">
        <div className="home-vendor reveal">
          <div className="home-vendor-glow" aria-hidden="true" />
          <div className="home-vendor-body">
            <span className="home-eyebrow home-eyebrow--light">Para vendedores</span>
            <h2 className="home-vendor-title">
              Coloca o teu negócio <span className="grad-text">no mapa</span>
            </h2>
            <p className="home-vendor-text">
              Mais visibilidade, mais clientes, mais vendas. Ativa a tua
              localização e fica visível para os banhistas mais próximos.
            </p>
            <div className="home-vendor-actions">
              <Link to="/planos" className="hero-pill hero-pill-primary">
                <FiTrendingUp size={18} />
                Ver planos
              </Link>
              <Link to="/como-funciona" className="hero-pill hero-pill-ghost">
                Como funciona
                <FiArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ CTA FINAL ══════════════ */}
      <section className="home-section">
        <div className="home-final reveal">
          <span className="home-final-sun" aria-hidden="true" />
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
