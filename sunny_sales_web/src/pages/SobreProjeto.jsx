import React from 'react';
import {
  FiMapPin,
  FiClock,
  FiSmartphone,
  FiHeart,
  FiCompass,
} from 'react-icons/fi';
import './SobreProjeto.css';

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?auto=format&fit=crop&w=1000&q=80';

const steps = [
  (
    <>
      O vendedor abre a aplicação e ativa a localização, ficando imediatamente
      visível no mapa para todos os banhistas nas proximidades.
    </>
  ),
  (
    <>
      O banhista acede ao mapa, filtra por tipo de produto e vê os vendedores
      mais próximos em tempo real.
    </>
  ),
  (
    <>
      O vendedor passa e o banhista recebe o produto sem ter de se levantar,
      de forma prática e eficiente para ambos.
    </>
  ),
];

export default function SobreProjeto() {
  return (
    <div className="sobre-page">

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="sobre-hero">
        <div className="sobre-hero-content">
          <h1 className="sobre-hero-title">
            Sobre o Projeto
          </h1>
          <p className="sobre-hero-lead">
            O <strong>Sunny Sales</strong> conecta vendedores ambulantes de praia
            a banhistas através de um{' '}
            <strong>mapa interativo em tempo real</strong>, unindo tradição,
            tecnologia e sustentabilidade nas praias portuguesas.
          </p>

          <div className="sobre-hero-badges">
            <span className="sobre-badge">
              <FiMapPin /> Praias portuguesas
            </span>
            <span className="sobre-badge">
              <FiClock /> Localização em tempo real
            </span>
            <span className="sobre-badge">
              <FiSmartphone /> Web &amp; Mobile
            </span>
          </div>
        </div>

        <div className="sobre-hero-media">
          <img
            src={HERO_IMAGE}
            alt="Chapéu de sol numa praia portuguesa ao pôr do sol"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </section>

      {/* ── Como Funciona ────────────────────────────────── */}
      <section className="sobre-section">
        <div className="sobre-section-head">
          <span className="sobre-section-icon">
            <FiCompass />
          </span>
          <h2 className="sobre-section-title">Como Funciona</h2>
        </div>

        <ol className="sobre-timeline">
          {steps.map((text, index) => (
            <li
              key={index}
              className={`sobre-step reveal reveal-d${(index % 3) + 1}`}
            >
              <div className="sobre-step-number">{index + 1}</div>
              <div className="sobre-step-card">
                <p className="sobre-step-text">{text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Banner ───────────────────────────────────────── */}
      <section className="sobre-banner reveal">
        <span className="sobre-banner-icon">
          <FiHeart />
        </span>
        <p className="sobre-banner-text">
          O <strong>Sunny Sales</strong> promove{' '}
          <strong>praticidade, sustentabilidade</strong> e a{' '}
          <strong>valorização do comércio local</strong> nas praias portuguesas.
        </p>
      </section>
    </div>
  );
}
