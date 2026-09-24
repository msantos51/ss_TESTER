import React, { useEffect, useState } from 'react';
import { FiShare2, FiStar, FiLock } from 'react-icons/fi';
import { BASE_URL, WEB_URL } from '../config.js';
import BrandHeader from '../components/BrandHeader.jsx';
import '../styles/PremiumScreen.css';

// (em português) Separador das avaliações dos clientes. O QR code pessoal é
// a ferramenta: o cliente lê-o e dá ao vendedor uma avaliação de 1 a 5
// estrelas. O QR code é de todos — as avaliações ficam sempre guardadas. O
// que o Premium acrescenta é mostrar a média: aqui e no cartão do mapa.

// Os passos são o que faltava para as "estrelas" se perceberem: quem dá as
// estrelas é o cliente, depois de comprar, pelo QR code.
const STEPS = [
  'Mostra o QR code ao cliente depois de uma venda — ou imprime-o e cola-o na mala.',
  'O cliente lê-o com a câmara do telemóvel.',
  'Dá-te uma avaliação de 1 a 5 estrelas, sem precisar de conta.',
];

const formatAverage = (value) => value.toLocaleString('pt-PT', {
  minimumFractionDigits: 1, maximumFractionDigits: 1,
});

function Stars({ value }) {
  const filled = Math.round(value);
  return (
    <span className="reviews-stars" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((n) => (
        <FiStar key={n} size={18} className={n <= filled ? 'is-on' : undefined} />
      ))}
    </span>
  );
}

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

  const hasReviews = isPremium && summary?.average != null && summary.count > 0;

  return (
    <div className="premium-screen">
      <BrandHeader>
        <h2 className="brand-header-title">Avaliações</h2>
        <p className="brand-header-subtitle">
          {hasReviews
            ? `Média ${formatAverage(summary.average)} · ${summary.count} ${summary.count === 1 ? 'avaliação' : 'avaliações'}`
            : 'Os clientes avaliam-te pelo QR code'}
        </p>
      </BrandHeader>

      <div className="premium-body">
        {/* A média é a vantagem Premium: sem ele fica o cadeado e o convite,
            para o vendedor perceber que as avaliações existem mas estão
            escondidas dos clientes. */}
        <section className={`reviews-summary${isPremium ? '' : ' is-locked'}`}>
          {!isPremium ? (
            <>
              <span className="reviews-summary-icon"><FiLock size={20} /></span>
              <h3 className="reviews-summary-title">A tua média está escondida</h3>
              <p className="reviews-summary-desc">
                As avaliações dos clientes ficam guardadas. Com Premium, a tua
                média aparece aqui e no teu cartão no mapa.
              </p>
              <button type="button" className="premium-cta" onClick={onGoPremium}>
                Ativar Premium
              </button>
            </>
          ) : hasReviews ? (
            <>
              <span className="reviews-summary-score">{formatAverage(summary.average)}</span>
              <Stars value={summary.average} />
              <p className="reviews-summary-desc">
                Média de {summary.count} {summary.count === 1 ? 'avaliação' : 'avaliações'} de
                clientes · aparece no teu cartão no mapa
              </p>
            </>
          ) : (
            <>
              <Stars value={0} />
              <h3 className="reviews-summary-title">Ainda sem avaliações</h3>
              <p className="reviews-summary-desc">
                Mostra o QR code aos clientes: a tua média aparece aqui e no
                teu cartão no mapa assim que chegar a primeira.
              </p>
            </>
          )}
        </section>

        <section className="premium-qr-card">
          <h2 className="premium-qr-title">O teu QR code de avaliação</h2>
          <ol className="reviews-steps">
            {STEPS.map((step, i) => (
              <li key={step}>
                <span className="reviews-step-num">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <div className="premium-qr-image">
            <img src={qrSrc} alt="QR code para os clientes avaliarem o vendedor" />
          </div>
          <button type="button" className="premium-qr-share" onClick={shareQr}>
            <FiShare2 size={17} /> Partilhar link de avaliação
          </button>
        </section>
      </div>
    </div>
  );
}
