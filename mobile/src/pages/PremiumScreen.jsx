import React, { useState, useEffect, useCallback } from 'react';
import {
  FiStar, FiRadio, FiImage, FiCheck, FiAlertTriangle, FiRefreshCw, FiArrowRight,
  FiShare2,
} from 'react-icons/fi';
import { BASE_URL, WEB_URL } from '../config.js';
import '../styles/PremiumScreen.css';

// (em português) Preço do Premium, a única compra da app: um pagamento único
// de 30 dias, sem renovação automática, para não haver cobranças-surpresa.
// O valor tem de acompanhar PREMIUM_PLAN no backend.
const PRICE_LABEL = '19,99 €';
const PERIOD_LABEL = 'por mês';

// As três vantagens, cada uma com o que o vendedor tem sem Premium e o que
// passa a ter com ele. A comparação é o argumento: sem ela isto seria uma
// lista de promessas soltas.
const BENEFITS = [
  {
    id: 'destaque',
    icon: FiStar,
    title: 'Destaque no mapa',
    description: 'O teu pin ganha uma estrela que te identifica como vendedor Premium — no meio de vários pins, é o que o banhista repara primeiro.',
    free: 'Pin normal',
    premium: 'Pin com estrela',
  },
  {
    id: 'alcance',
    icon: FiRadio,
    title: 'Raio de alcance',
    description: 'Sem Premium só apareces a quem já está mesmo ao teu lado. Com Premium és encontrado de uma ponta à outra da praia.',
    free: '300 m',
    premium: '1 km',
  },
  {
    id: 'fotos',
    icon: FiImage,
    title: 'Fotos dos produtos',
    description: 'No plano gratuito os produtos ficam-se pelo nome e pelo preço. Com Premium cada produto leva a sua fotografia.',
    free: 'Nome e preço',
    premium: 'Nome, preço e foto',
  },
  {
    id: 'avaliacoes',
    icon: FiStar,
    title: 'Avaliações por QR code',
    description: 'Recebes um QR code pessoal para mostrar no teu ponto de venda. Quem o lê deixa-te uma classificação de 1 a 5 estrelas, e a tua média aparece no cartão do mapa.',
    free: 'Sem avaliações',
    premium: 'QR e estrelas',
  },
];

const FAQS = [
  {
    q: 'Tenho de pagar para aparecer no mapa?',
    a: 'Não. Estar no mapa é gratuito e sempre foi o suficiente para vender. O Premium é opcional: acrescenta o destaque, o alcance e as fotos.',
  },
  {
    q: 'É cobrado automaticamente todos os meses?',
    a: 'Não. É um pagamento único que te dá 30 dias de Premium. Só voltas a pagar se quiseres, e podes comprar outro período antes de o atual acabar — os dias somam-se.',
  },
  {
    q: 'O que acontece às fotos se o Premium acabar?',
    a: 'As fotos já publicadas continuam nos teus produtos. Enquanto não tiveres Premium é que não podes adicionar nem trocar fotografias.',
  },
];

export default function PremiumScreen({ auth, onUserUpdate }) {
  const { token, user, vendorId } = auth;
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const [summary, setSummary] = useState(null);

  const isPremium = Boolean(user?.is_premium);
  const validUntil = user?.premium_valid_until
    ? new Date(user.premium_valid_until).toLocaleDateString('pt-PT')
    : null;

  // Endereço da página de avaliação (o mesmo que o QR code contém) e imagem do
  // QR gerada pelo backend. Só fazem sentido para quem tem Premium.
  const reviewUrl = `${WEB_URL.replace(/\/$/, '')}/avaliar/${vendorId}`;
  const qrSrc = `${BASE_URL}/vendors/${vendorId}/qr.png?v=2`;

  // Média de avaliações, para o vendedor ver o retorno do seu QR code.
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
    // Partilha nativa quando disponível (permite guardar/enviar o link do QR);
    // caso contrário copia o endereço para a área de transferência.
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
      /* utilizador cancelou a partilha — sem erro a mostrar */
    }
  };

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
      <header className="premium-header">
        <span className="premium-badge">
          <FiStar size={13} /> Premium
        </span>
        <h1 className="premium-title">Sê o vendedor que se vê primeiro</h1>
        <p className="premium-lead">
          No plano gratuito já estás no mapa. O Premium faz com que te
          encontrem de longe — e que vejam o que estás a vender.
        </p>
        <span className="premium-hero-price">
          <strong>{PRICE_LABEL}</strong>
          <span>/ 30 dias</span>
        </span>
      </header>

      <div className="premium-body">
        {error && (
          <div className="ss-error">
            <FiAlertTriangle size={17} />
            <span>{error}</span>
          </div>
        )}

        <div className={`premium-status${isPremium ? ' is-active' : ''}`}>
          <span className="premium-status-icon"><FiStar size={18} /></span>
          <div className="premium-status-text">
            <span className="premium-status-title">
              {isPremium ? 'Premium ativo' : 'Ainda sem Premium'}
            </span>
            <span className="premium-status-desc">
              {isPremium
                ? `Válido até ${validUntil || '—'}`
                : 'Estás no plano gratuito: 300 m de alcance e produtos sem foto.'}
            </span>
          </div>
          <button
            type="button"
            className="premium-status-refresh"
            onClick={() => refreshProfile()}
            disabled={refreshing}
            aria-label="Atualizar estado do Premium"
          >
            <FiRefreshCw size={16} className={refreshing ? 'is-spinning' : undefined} />
          </button>
        </div>

        {isPremium && (
          <section className="premium-qr-card">
            <div className="premium-qr-head">
              <h2 className="premium-qr-title">O teu QR code</h2>
              {summary?.average != null ? (
                <span className="premium-qr-rating">
                  <FiStar size={14} />
                  <strong>{summary.average.toFixed(1)}</strong>
                  <span className="premium-qr-rating-count">
                    ({summary.count})
                  </span>
                </span>
              ) : (
                <span className="premium-qr-rating premium-qr-rating--empty">
                  Sem avaliações ainda
                </span>
              )}
            </div>
            <p className="premium-qr-desc">
              Mostra-o no teu ponto de venda. Quem o ler deixa-te uma
              classificação de 1 a 5 estrelas — e a tua média aparece no
              cartão do mapa.
            </p>
            <div className="premium-qr-image">
              <img src={qrSrc} alt="QR code para avaliação do vendedor" />
            </div>
            <button type="button" className="premium-qr-share" onClick={shareQr}>
              <FiShare2 size={16} /> Partilhar link de avaliação
            </button>
          </section>
        )}

        <section className="premium-group">
          <h2 className="ss-group-label">O que ganhas</h2>
          <div className="premium-benefits">
            {BENEFITS.map(({ id, icon: Icon, title, description, free, premium }) => (
              <article className="premium-benefit" key={id}>
                <div className="premium-benefit-head">
                  <span className="premium-benefit-icon"><Icon size={18} /></span>
                  <h3 className="premium-benefit-title">{title}</h3>
                </div>
                <p className="premium-benefit-desc">{description}</p>
                <div className="premium-flow">
                  <span className="premium-flow-free">{free}</span>
                  <FiArrowRight className="premium-flow-arrow" size={15} aria-hidden="true" />
                  <span className="premium-flow-premium">
                    <FiCheck size={13} aria-hidden="true" />
                    {premium}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="premium-price-card">
          <span className="premium-price-eyebrow">Premium · 30 dias</span>
          <div className="premium-price">
            <span className="premium-price-amount">{PRICE_LABEL}</span>
            <span className="premium-price-period">{PERIOD_LABEL}</span>
          </div>
          <ul className="premium-price-list">
            {BENEFITS.map(({ id, title, premium }) => (
              <li key={id}>
                <span className="premium-check"><FiCheck size={12} /></span>
                <span>{title} · <strong>{premium}</strong></span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="premium-cta"
            onClick={handleSubscribe}
            disabled={loading}
          >
            {loading
              ? 'A processar…'
              : isPremium ? 'Renovar mais 30 dias' : 'Ativar Premium'}
          </button>
          <p className="premium-price-note">
            Pagamento único de 30 dias, seguro via Stripe. Sem renovação
            automática — comprar com o Premium ativo soma os dias ao que já tens.
          </p>
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
    </div>
  );
}
