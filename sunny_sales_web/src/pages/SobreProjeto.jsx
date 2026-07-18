import React from 'react';
import {
  FiMapPin,
  FiClock,
  FiSmartphone,
  FiHeart,
  FiCompass,
} from 'react-icons/fi';
import InfoBanner from '../components/InfoBanner';
import './InfoPage.css';

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
    <div className="info-page">

      {/* ── Hero (padrão partilhado das páginas internas) ── */}
      <section className="info-hero">
        <h1 className="info-hero-title">
          Sobre o Projeto
        </h1>
        <p className="info-hero-lead">
          O <strong>Sunny Sales</strong> conecta vendedores ambulantes de praia
          a banhistas através de um{' '}
          <strong>mapa interativo em tempo real</strong>, unindo tradição,
          tecnologia e sustentabilidade nas praias portuguesas.
        </p>

        <div className="info-badges">
          <span className="info-badge">
            <FiMapPin /> Praias portuguesas
          </span>
          <span className="info-badge">
            <FiClock /> Localização em tempo real
          </span>
          <span className="info-badge">
            <FiSmartphone /> Web &amp; Mobile
          </span>
        </div>
      </section>

      {/* ── Como Funciona ────────────────────────────────── */}
      <section className="info-section">
        <div className="info-section-head">
          <span className="info-section-icon">
            <FiCompass />
          </span>
          <h2 className="info-section-title">Como Funciona</h2>
        </div>

        <ol className="info-timeline">
          {steps.map((text, index) => (
            <li
              key={index}
              className={`reveal reveal-d${(index % 3) + 1}`}
            >
              <div className="info-timeline-number">{index + 1}</div>
              <div className="info-timeline-body">{text}</div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Banner ───────────────────────────────────────── */}
      <InfoBanner icon={FiHeart}>
        O <strong>Sunny Sales</strong> promove{' '}
        <strong>praticidade, sustentabilidade</strong> e a{' '}
        <strong>valorização do comércio local</strong> nas praias portuguesas.
      </InfoBanner>
    </div>
  );
}
