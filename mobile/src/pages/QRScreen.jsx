import React, { useEffect, useState } from 'react';
import { FiShare2, FiStar } from 'react-icons/fi';
import { BASE_URL, WEB_URL } from '../config.js';
import '../styles/PremiumScreen.css';

// (em português) Separador dedicado ao QR code pessoal do vendedor Premium.
// Substitui o separador de Trajetos, que foi removido.
// Não-Premium: mostra um cartão de convite simples.
// Premium: mostra o QR code + botões de partilha e de geração de novo código.

export default function QRScreen({ auth, onGoPremium }) {
  const { user, vendorId } = auth;
  const isPremium = Boolean(user?.is_premium);

  const reviewUrl = `${WEB_URL.replace(/\/$/, '')}/avaliar/${vendorId}`;
  const qrSrc = `${BASE_URL}/vendors/${vendorId}/qr.png`;

  const [summary, setSummary] = useState(null);

  useEffect(() => {
    let alive = true;
    fetch(`${BASE_URL}/vendors/${vendorId}/reviews/summary`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (alive) setSummary(data); })
      .catch(() => {});
    return () => { alive = false; };
  }, [vendorId]);

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

  if (!isPremium) {
    return (
      <div className="premium-screen">
        <header className="premium-header">
          <span className="premium-badge">
            <FiStar size={13} /> Premium
          </span>
          <h1 className="premium-title">O teu QR code pessoal</h1>
          <p className="premium-lead">
            Com o Premium recebes um QR code que os clientes lêem para te
            deixar uma avaliação de 1 a 5 estrelas. A tua média aparece no
            cartão do mapa.
          </p>
        </header>
        <div className="premium-body">
          {summary?.count > 0 && (
            <div className="premium-qr-head" style={{ marginBottom: '1rem' }}>
              <span className="premium-qr-rating">
                <FiStar size={14} />
                <strong>{summary.average.toFixed(1)}</strong>
                <span className="premium-qr-rating-count">({summary.count} {summary.count === 1 ? 'avaliação' : 'avaliações'})</span>
              </span>
            </div>
          )}
          <button
            type="button"
            className="premium-cta"
            style={{ marginTop: 0 }}
            onClick={onGoPremium}
          >
            Ativar Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-screen">
      <header className="premium-header">
        <span className="premium-badge">
          <FiStar size={13} /> Premium
        </span>
        <h1 className="premium-title">O teu QR code pessoal</h1>
        <p className="premium-lead">
          Imprime-o ou mostra-o na app. Cada leitura gera automaticamente um
          código de uso único — uma avaliação por scan, sem repetições.
        </p>
      </header>

      <div className="premium-body">
        <section className="premium-qr-card">
          <div className="premium-qr-head">
            <h2 className="premium-qr-title">QR code</h2>
            {summary?.average != null ? (
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
            Quem o ler deixa-te uma classificação de 1 a 5 estrelas — e a tua
            média aparece no cartão do mapa.
          </p>
          <div className="premium-qr-image">
            <img src={qrSrc} alt="QR code para avaliação do vendedor" />
          </div>
          <button type="button" className="premium-qr-share" onClick={shareQr}>
            <FiShare2 size={16} /> Partilhar link de avaliação
          </button>
        </section>
      </div>
    </div>
  );
}
