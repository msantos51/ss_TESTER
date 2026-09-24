import React, { useEffect, useState } from 'react';
import {
  FiX, FiStar, FiShoppingBag, FiSmartphone, FiCreditCard, FiCheck, FiMinus,
} from 'react-icons/fi';
import { TbCurrencyEuro } from 'react-icons/tb';
import { mediaUrl } from '../config.js';
import './PremiumExample.css';

// (em português) Exemplo de como os clientes veem um vendedor Premium no mapa
// do site, para quem ainda não tem Premium perceber o que compra. O cartão
// reproduz o do site (sunny_sales_web/src/pages/Home.jsx, `.vendor-card`) com
// os dados do próprio vendedor — nome, foto, cor do pin, produto e formas de
// pagamento —, e os produtos e as avaliações são de exemplo, porque sem
// Premium ele ainda não os tem à vista. O interruptor mostra o mesmo cartão
// sem Premium: a diferença é o argumento.

const DEFAULT_PIN = '#1D5C3A';

const PAYMENT_ICONS = {
  'MB Way': FiSmartphone,
  'Numerário': TbCurrencyEuro,
  'Cartão': FiCreditCard,
};

const SAMPLE_PRODUCTS = [
  { id: 1, name: 'Bola de Berlim', price: 1.5, emoji: '🍩', tint: 'sun' },
  { id: 2, name: 'Gelado de nata', price: 2.5, emoji: '🍦', tint: 'ocean' },
  { id: 3, name: 'Água fresca 50 cl', price: 1, emoji: '💧', tint: 'sand' },
];

const SAMPLE_RATING = { average: 4.8, count: 23 };

// Cada nota explica uma parte do cartão; o número é o mesmo que aparece
// sobre essa parte na ilustração.
const NOTES = [
  {
    id: 'estrela',
    premium: ['Estrela no teu pin', 'Destaca-te no meio dos outros vendedores.'],
    free: ['Pin igual aos outros', 'Nada te distingue no mapa.'],
  },
  {
    id: 'alcance',
    premium: ['1 km de alcance', 'Apareces a quem está até 1 km de ti.'],
    free: ['Só 300 m de alcance', 'Só te vê quem já está ao teu lado.'],
  },
  {
    id: 'avaliacoes',
    premium: ['Avaliações dos clientes', 'A média das estrelas que recebes pelo teu QR code.'],
    free: ['Avaliações escondidas', 'Ficam guardadas, mas o cliente não as vê.'],
  },
  {
    id: 'produtos',
    premium: ['Produtos com foto e preço', 'O cliente vê o que vendes antes de te chamar.'],
    free: ['Sem produtos', 'O cliente não sabe o que tens nem quanto custa.'],
  },
];

const formatPrice = (value) => value.toLocaleString('pt-PT', {
  style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
});

function Marker({ n }) {
  return <span className="pex-marker" aria-hidden="true">{n}</span>;
}

// Gota do site: sólida na cor do vendedor, com miolo branco ou, com
// Premium, a estrela branca no lugar do miolo.
function Pin({ color, premium, className = '', style }) {
  return (
    <span className={`pex-pin ${className}`} style={{ '--pin-color': color, ...style }}>
      {premium ? (
        <FiStar className="pex-pin-star" size={15} />
      ) : (
        <span className="pex-pin-core" />
      )}
    </span>
  );
}

export default function PremiumExample({ user, priceLabel, onClose, onSubscribe }) {
  const [premium, setPremium] = useState(true);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const pinColor = user?.pin_color || DEFAULT_PIN;
  const name = user?.name || 'O teu nome';
  const product = user?.product || 'Bolas de Berlim';
  const photo = user?.profile_photo ? mediaUrl(user.profile_photo) : null;
  const payments = (user?.payment_methods || 'MB Way,Numerário')
    .split(',')
    .map((m) => m.trim())
    .filter((m) => PAYMENT_ICONS[m]);

  return (
    <div className="pex-overlay" onClick={onClose}>
      <div
        className="pex-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pex-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="pex-head">
          <div>
            <h2 id="pex-title" className="pex-title">Assim te veem os clientes</h2>
            <p className="pex-subtitle">O teu cartão no mapa do site</p>
          </div>
          <button type="button" className="pex-close" onClick={onClose} aria-label="Fechar">
            <FiX size={20} />
          </button>
        </header>

        <div className="pex-body">
          <div className="pex-toggle" role="group" aria-label="Comparar">
            <button
              type="button"
              className={!premium ? 'is-active' : undefined}
              aria-pressed={!premium}
              onClick={() => setPremium(false)}
            >
              Sem Premium
            </button>
            <button
              type="button"
              className={premium ? 'is-active is-premium' : undefined}
              aria-pressed={premium}
              onClick={() => setPremium(true)}
            >
              <FiStar size={13} aria-hidden="true" /> Com Premium
            </button>
          </div>

          {/* A cena é decorativa: tudo o que ela mostra está dito nas notas. */}
          <div className={`pex-stage${premium ? ' is-premium' : ''}`} aria-hidden="true">
            <svg className="pex-sea" viewBox="0 0 320 60" preserveAspectRatio="none">
              <path d="M0 0H320V30C290 42 262 22 230 32S164 46 128 34 60 22 32 36 8 40 0 38Z" />
            </svg>
            {[[10, 50], [27, 72], [83, 44], [93, 68]].map(([x, y]) => (
              <Pin
                key={`${x}-${y}`}
                color="#9FBAC4"
                premium={false}
                className="pex-pin--other"
                style={{ left: `${x}%`, top: `${y}%` }}
              />
            ))}
            <span className="pex-reach">
              <span className="pex-reach-tag">
                <span className="pex-reach-label">{premium ? '1 km' : '300 m'}</span>
                {premium && <Marker n={2} />}
              </span>
            </span>
            <span className="pex-me">
              <Pin color={pinColor} premium={premium} />
              {premium && <Marker n={1} />}
            </span>
          </div>

          <article className="pex-card">
            <div className="pex-card-head">
              {photo ? (
                <img src={photo} alt="" className="pex-card-photo" />
              ) : (
                <span className="pex-card-photo" style={{ background: pinColor }} />
              )}
              <div className="pex-card-head-text">
                <h3 className="pex-card-name">
                  {name}
                  {premium && (
                    <span className="pex-card-premium">
                      <FiStar size={10} aria-hidden="true" /> Premium
                    </span>
                  )}
                </h3>
                <p className="pex-card-sub">{product}</p>
              </div>
            </div>

            {premium && (
              <div className="pex-card-rating">
                <span className="pex-card-stars" aria-hidden="true">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <FiStar key={n} size={14} className={n <= Math.round(SAMPLE_RATING.average) ? 'is-on' : undefined} />
                  ))}
                </span>
                <span className="pex-card-rating-text">
                  {SAMPLE_RATING.average.toLocaleString('pt-PT', { minimumFractionDigits: 1 })}
                  <span className="pex-card-rating-count"> · {SAMPLE_RATING.count} avaliações</span>
                </span>
                <Marker n={3} />
              </div>
            )}

            {payments.length > 0 && (
              <div className="pex-card-payments">
                {payments.map((method) => {
                  const Icon = PAYMENT_ICONS[method];
                  return (
                    <span key={method} className="pex-card-chip">
                      <Icon size={13} aria-hidden="true" /> {method}
                    </span>
                  );
                })}
              </div>
            )}

            {premium && (
              <div className="pex-card-products">
                <div className="pex-card-products-title">
                  <FiShoppingBag size={13} aria-hidden="true" />
                  <span>Produtos disponíveis</span>
                  <Marker n={4} />
                </div>
                {SAMPLE_PRODUCTS.map((p) => (
                  <div key={p.id} className="pex-card-product">
                    <span className={`pex-card-product-photo is-${p.tint}`} aria-hidden="true">{p.emoji}</span>
                    <span className="pex-card-product-name">{p.name}</span>
                    <span className="pex-card-product-price">{formatPrice(p.price)}</span>
                  </div>
                ))}
              </div>
            )}
          </article>

          <ol className={`pex-notes${premium ? ' is-premium' : ''}`}>
            {NOTES.map((note, i) => {
              const [title, text] = premium ? note.premium : note.free;
              return (
                <li key={note.id}>
                  <span className="pex-note-icon">
                    {premium ? <FiCheck size={13} strokeWidth={3} /> : <FiMinus size={13} strokeWidth={3} />}
                  </span>
                  <span className="pex-note-text">
                    <strong>
                      {premium && <span className="pex-note-n">{i + 1}</span>}
                      {title}
                    </strong>
                    <span>{text}</span>
                  </span>
                </li>
              );
            })}
          </ol>

          <p className="pex-disclaimer">
            Com os teus dados do perfil; os produtos e as avaliações são de exemplo.
          </p>
        </div>

        <footer className="pex-foot">
          <button type="button" className="premium-cta" onClick={onSubscribe}>
            Ativar Premium · {priceLabel}
          </button>
        </footer>
      </div>
    </div>
  );
}
