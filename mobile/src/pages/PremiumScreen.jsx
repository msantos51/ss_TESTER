import React, { useState, useEffect, useCallback } from 'react';
import {
  FiStar, FiRadio, FiShoppingBag, FiAward, FiCheck, FiX, FiAlertTriangle,
  FiRefreshCw, FiCreditCard, FiRepeat, FiShield, FiEye,
} from 'react-icons/fi';
import { BASE_URL } from '../config.js';
import BrandHeader from '../components/BrandHeader.jsx';
import PremiumExample from '../components/PremiumExample.jsx';
import '../styles/PremiumScreen.css';

// (em português) Preço do Premium, a única compra da app: um pagamento único
// de 30 dias, sem renovação automática, para não haver cobranças-surpresa.
// Os valores têm de acompanhar PREMIUM_PLAN no backend.
const PRICE_EUR = 19.99;
const PREMIUM_DAYS = 30;
const formatEur = (value) => value.toLocaleString('pt-PT', {
  style: 'currency', currency: 'EUR', minimumFractionDigits: 2,
});
const PRICE_LABEL = formatEur(PRICE_EUR);
// O preço por dia é o argumento que faz 19,99 € parecer pouco para quem vende
// o dia inteiro na praia.
const DAILY_LABEL = formatEur(PRICE_EUR / PREMIUM_DAYS);

// Mesma cor por omissão do pin do mapa (MapTab), para a ilustração mostrar o
// pin que o vendedor já conhece.
const DEFAULT_PIN = '#1D5C3A';

// O vendedor decide numa olhadela, por isso cada vantagem é uma linha da
// tabela com o que tem hoje e o que passa a ter — sem parágrafos. `free: null`
// quer dizer que o plano gratuito não a tem.
const COMPARISON = [
  { id: 'destaque', icon: FiStar, label: 'Estrela no teu pin', free: null, premium: true },
  { id: 'alcance', icon: FiRadio, label: 'Alcance no mapa', free: '300 m', premium: '1 km' },
  { id: 'produtos', icon: FiShoppingBag, label: 'Produtos com foto e preço', free: null, premium: true },
  { id: 'avaliacoes', icon: FiAward, label: 'Avaliações dos clientes', free: null, premium: true },
];

const TRUST = [
  { id: 'unico', icon: FiCreditCard, label: 'Pagamento único' },
  { id: 'renovacao', icon: FiRepeat, label: 'Sem renovação automática' },
  { id: 'stripe', icon: FiShield, label: 'Seguro via Stripe' },
];

const FAQS = [
  {
    q: 'Tenho de pagar para aparecer no mapa?',
    a: 'Não. Aparecer no mapa é grátis. O Premium junta a estrela no pin, 1 km de alcance, os teus produtos e as avaliações dos clientes.',
  },
  {
    q: 'É cobrado todos os meses?',
    a: 'Não. Pagas uma vez e ficas com 30 dias. Se comprares antes de acabar, os dias somam-se.',
  },
  {
    q: 'Como funcionam as avaliações?',
    a: 'No separador Avaliações tens o teu QR code. Depois de uma venda, o cliente lê-o com a câmara e dá-te de 1 a 5 estrelas. As avaliações ficam sempre guardadas; com Premium, a média aparece no teu cartão no mapa.',
  },
  {
    q: 'E quando o Premium acabar?',
    a: 'Voltas ao plano grátis: continuas no mapa, mas os produtos e a média das avaliações deixam de aparecer aos clientes. Fica tudo guardado e volta a aparecer quando renovares.',
  },
];

// Praia vista de cima: o pin do vendedor, com a estrela e o raio de 1 km,
// no meio dos pins dos outros vendedores. Mostra a vantagem antes de se ler.
function BeachPreview({ pinColor }) {
  return (
    <svg
      className="premium-map"
      viewBox="0 0 320 128"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <rect className="premium-map-sand" width="320" height="128" />
      <path
        className="premium-map-sea"
        d="M0 0H320V34C292 44 262 26 230 36S164 48 128 36 60 26 32 38 8 42 0 40Z"
      />
      <path
        className="premium-map-foam"
        d="M0 46C20 48 40 34 70 42S126 52 160 42 228 34 262 44 304 46 320 40"
      />

      {[[34, 86], [92, 104], [120, 64], [252, 100], [292, 72]].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} className="premium-map-pin" cx={cx} cy={cy} r="6" />
      ))}

      <circle className="premium-map-reach" cx="186" cy="74" r="40" />
      <circle className="premium-map-pulse" cx="186" cy="74" r="20" />
      <circle
        className="premium-map-me"
        cx="186"
        cy="74"
        r="12"
        style={{ fill: pinColor }}
      />
      <circle className="premium-map-star-bg" cx="196" cy="63" r="8" />
      <polygon
        className="premium-map-star"
        points="196 57.5 197.6 61.2 201.6 61.3 198.5 63.8 199.6 67.7 196 65.5 192.4 67.7 193.5 63.8 190.4 61.3 194.4 61.2"
      />

      <g className="premium-map-chip" transform="translate(216 32)">
        <rect width="38" height="20" rx="10" />
        <text x="19" y="14" textAnchor="middle">1 km</text>
      </g>
    </svg>
  );
}

export default function PremiumScreen({ auth, onUserUpdate }) {
  const { token, user, vendorId } = auth;
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [showExample, setShowExample] = useState(false);

  const isPremium = Boolean(user?.is_premium);
  const validUntil = user?.premium_valid_until
    ? new Date(user.premium_valid_until).toLocaleDateString('pt-PT')
    : null;

  // O pagamento acontece no browser do sistema, fora da app: ao voltar, o
  // estado guardado ainda é o de antes de comprar. Recarregar o perfil é o que
  // faz o ecrã passar a "Premium ativo" sem obrigar a sair e a entrar.
  const refreshProfile = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch(`${BASE_URL}/vendors/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Não foi possível atualizar o estado do Premium');
      const fresh = await res.json();
      onUserUpdate?.(fresh);
      setError(null);
    } catch (err) {
      if (!silent) setError(err.message);
    } finally {
      if (!silent) setRefreshing(false);
    }
  }, [token, onUserUpdate]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshProfile({ silent: true });
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refreshProfile]);

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}/vendors/${vendorId}/create-checkout-session?plan=premium`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.detail || 'Não foi possível criar a sessão de pagamento');
      }
      const data = await response.json();
      if (data.checkout_url) window.open(data.checkout_url, '_system');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="premium-screen">
      <BrandHeader>
        <h2 className="brand-header-title">Premium</h2>
        <p className="brand-header-subtitle">
          {isPremium
            ? `Ativo até ${validUntil || '—'}`
            : 'Destaca-te na praia e vende mais'}
        </p>
      </BrandHeader>

      <div className="premium-body">
        {error && (
          <div className="ss-error">
            <FiAlertTriangle size={17} />
            <span>{error}</span>
          </div>
        )}

        {/* O essencial cabe no primeiro ecrã: o que se ganha (a ilustração),
            quanto custa e o botão. O resto é para quem ainda hesita. */}
        <section className={`premium-hero${isPremium ? ' is-active' : ''}`}>
          <BeachPreview pinColor={user?.pin_color || DEFAULT_PIN} />

          <div className="premium-hero-content">
            <span className="premium-badge">
              <FiStar size={12} aria-hidden="true" />
              {isPremium ? 'Premium ativo' : 'Premium'}
            </span>
            <h3 className="premium-hero-title">
              {isPremium ? 'Estás em destaque na praia' : 'Sê o primeiro pin que o banhista vê'}
            </h3>

            {isPremium ? (
              <p className="premium-hero-until">
                Válido até <strong>{validUntil || '—'}</strong>
              </p>
            ) : (
              <div className="premium-price">
                <span className="premium-price-amount">{PRICE_LABEL}</span>
                <span className="premium-price-period">
                  / {PREMIUM_DAYS} dias
                  <span className="premium-price-daily">Só {DAILY_LABEL} por dia</span>
                </span>
              </div>
            )}

            <button
              type="button"
              className="premium-cta"
              onClick={handleSubscribe}
              disabled={loading}
            >
              {loading
                ? 'A processar…'
                : isPremium
                  ? `Juntar mais ${PREMIUM_DAYS} dias · ${PRICE_LABEL}`
                  : 'Ativar Premium'}
            </button>

            {/* Antes de pagar, ver o resultado: o cartão como o cliente o vê,
                com e sem Premium. */}
            {!isPremium && (
              <button
                type="button"
                className="premium-example-btn"
                onClick={() => setShowExample(true)}
              >
                <FiEye size={17} aria-hidden="true" />
                Ver como fica o teu cartão
              </button>
            )}

            <ul className="premium-trust">
              {TRUST.map(({ id, icon: Icon, label }) => (
                <li key={id}>
                  <Icon size={14} aria-hidden="true" />
                  <span>{label}</span>
                </li>
              ))}
            </ul>

            <button
              type="button"
              className="premium-refresh"
              onClick={() => refreshProfile()}
              disabled={refreshing}
            >
              <FiRefreshCw size={13} className={refreshing ? 'is-spinning' : undefined} aria-hidden="true" />
              {isPremium ? 'Atualizar estado' : 'Já pagaste? Atualizar estado'}
            </button>
          </div>
        </section>

        <section className="premium-group">
          <h2 className="ss-group-label">Grátis vs Premium</h2>
          <table className="premium-compare">
            <thead>
              <tr>
                <th scope="col"><span className="premium-sr-only">Vantagem</span></th>
                <th scope="col">Grátis</th>
                <th scope="col" className="premium-compare-col">
                  <FiStar size={11} aria-hidden="true" />
                  Premium
                </th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map(({ id, icon: Icon, label, free, premium }) => (
                <tr key={id}>
                  <th scope="row">
                    <span className="premium-compare-feature">
                      <span className="premium-compare-icon"><Icon size={15} aria-hidden="true" /></span>
                      {label}
                    </span>
                  </th>
                  <td className="premium-compare-free">
                    {free || (
                      <>
                        <span className="premium-compare-cross">
                          <FiX size={13} strokeWidth={3} aria-hidden="true" />
                        </span>
                        <span className="premium-sr-only">Não</span>
                      </>
                    )}
                  </td>
                  <td className="premium-compare-premium">
                    {premium === true ? (
                      <span className="premium-compare-check">
                        <FiCheck size={13} strokeWidth={3} aria-hidden="true" />
                        <span className="premium-sr-only">Sim</span>
                      </span>
                    ) : premium}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="premium-group">
          <h2 className="ss-group-label">Perguntas frequentes</h2>
          <div className="premium-faq">
            {FAQS.map((faq) => (
              <details className="premium-faq-item" key={faq.q}>
                <summary className="premium-faq-q">{faq.q}</summary>
                <p className="premium-faq-a">{faq.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>

      {showExample && (
        <PremiumExample
          user={user}
          priceLabel={PRICE_LABEL}
          onClose={() => setShowExample(false)}
          onSubscribe={() => { setShowExample(false); handleSubscribe(); }}
        />
      )}
    </div>
  );
}
