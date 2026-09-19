import React, { useEffect, useState } from 'react';
import { FiShare2, FiStar, FiLock } from 'react-icons/fi';
import { BASE_URL, WEB_URL } from '../config.js';
import '../styles/PremiumScreen.css';

// (em português) Separador dedicado ao QR code pessoal do vendedor.
// Substitui o separador de Trajetos, que foi removido.
// O QR code é de todos — sem ele o vendedor não tinha como recolher
// avaliações. O que o Premium acrescenta é mostrar a pontuação: a média e o
// número de estrelas, aqui e no cartão do mapa. Sem Premium as avaliações
// continuam a ser registadas, só não estão à vista.

export default function QRScreen({ auth, onGoPremium }) {
  const { user, vendorId } = auth;
  const isPremium = Boolean(user?.is_premium);

  const reviewUrl = `${WEB_URL.replace(/\/$/, '')}/avaliar/${vendorId}`;
  const qrSrc = `${BASE_URL}/vendors/${vendorId}/qr.png`;

  const [summary, setSummary] = useState(null);

  useEffect(() => {
    if (!isPremium) { setSummary(null); return; }
    let alive = true;
    fetch(`${BASE_URL}/vendors/${vendorId}/reviews/summary`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (alive) setSummary(data); })
      .catch(() => {});
    return () => { alive = false; };
  }, [isPremium, vendorId]);

  const shareQr = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Avalia-me na Sunny Sales',
          text: 'Deixa a tua avaliação de 1 a 5 estrelas:',
          url: reviewUrl,
        });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(reviewUrl);
      }
    } catch {
      /* utilizador cancelou */
    }
  };

  return (
    <div className="premium-screen">
      <header className="premium-header">
        {isPremium && (
          <span className="premium-badge">
            <FiStar size={13} /> Premium
          </span>
        )}
        <h1 className="premium-title">O teu QR code pessoal</h1>
        <p className="premium-lead">
          {isPremium
            ? `Imprime-o ou mostra-o na app. Cada leitura gera automaticamente um
               código de uso único — uma avaliação por scan, sem repetições.`
            : `Imprime-o ou mostra-o na app: quem o lê deixa-te uma classificação
               de 1 a 5 estrelas. Com Premium passas a ver a tua pontuação — aqui
               e no cartão do mapa.`}
        </p>
      </header>

      <div className="premium-body">
        <section className="premium-qr-card">
          <div className="premium-qr-head">
            <h2 className="premium-qr-title">QR code</h2>
            {/* A pontuação é a vantagem Premium: sem ele fica o cadeado no
                lugar da média, para o vendedor perceber o que lhe falta. */}
            {!isPremium ? (
              <span className="premium-qr-rating premium-qr-rating--locked">
                <FiLock size={13} /> Pontuação com Premium
              </span>
            ) : summary?.average != null ? (
              <span className="premium-qr-rating">
                <FiStar size={14} />
                <strong>{summary.average.toFixed(1)}</strong>
                <span className="premium-qr-rating-count">({summary.count})</span>
              </span>
            ) : (
              <span className="premium-qr-rating premium-qr-rating--empty">
                Sem avaliações ainda
              </span>
            )}
          </div>
          <p className="premium-qr-desc">
            {isPremium
              ? `Quem o ler deixa-te uma classificação de 1 a 5 estrelas — e a tua
                 média aparece no cartão do mapa.`
              : `Quem o ler deixa-te uma classificação de 1 a 5 estrelas. As
                 avaliações ficam guardadas; só com Premium é que a média passa a
                 aparecer aqui e no cartão do mapa.`}
          </p>
          <div className="premium-qr-image">
            <img src={qrSrc} alt="QR code para avaliação do vendedor" />
          </div>
          <button type="button" className="premium-qr-share" onClick={shareQr}>
            <FiShare2 size={16} /> Partilhar link de avaliação
          </button>
          {!isPremium && (
            <button
              type="button"
              className="premium-cta"
              style={{ marginTop: 0 }}
              onClick={onGoPremium}
            >
              Ativar Premium
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
