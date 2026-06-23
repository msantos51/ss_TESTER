import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../config.js';
import '../styles/PlansScreen.css';

const CheckIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="3">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const ZapIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
  </svg>
);

const StarIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <polygon points="12 2 15.09 10.26 24 10.27 17.18 16.91 20.16 25.12 12 19.54 3.84 25.12 6.82 16.91 0 10.27 8.91 10.26" />
  </svg>
);

const TrendingUpIcon = ({ size = 14 }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 17" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const PLANS = [
  {
    id: 'semanal',
    label: 'Semanal',
    period: 'semana',
    price: 9.99,
    pricePerDay: (9.99 / 7).toFixed(2),
    badge: null,
    highlight: false,
    description: 'Ideal para experimentar a plataforma ou para vendedores esporádicos.',
    features: [
      'Visibilidade no mapa durante 7 dias',
      'Partilha de localização em tempo real',
      'Perfil de vendedor completo',
      'Estatísticas avançadas de clientes',
      'Suporte prioritário',
      'Promoção de produtos',
      'Perfil personalizável',
    ],
    cta: 'Começar Semanal',
    color: 'var(--primary)',
  },
  {
    id: 'mensal',
    label: 'Mensal',
    period: 'mês',
    price: 24.99,
    pricePerDay: (24.99 / 30).toFixed(2),
    badge: 'Mais Popular',
    highlight: true,
    description: 'A escolha inteligente para vendedores regulares. Máxima poupança, máxima visibilidade.',
    features: [
      'Visibilidade no mapa durante 30 dias',
      'Partilha de localização em tempo real',
      'Perfil de vendedor completo',
      'Estatísticas avançadas de clientes',
      'Suporte prioritário',
      'Promoção de produtos',
      'Perfil personalizável',
    ],
    cta: 'Escolher Mensal',
    color: 'var(--secondary)',
  },
  {
    id: 'quinzenal',
    label: 'Quinzenal',
    period: 'quinzena',
    price: 16.99,
    pricePerDay: (16.99 / 15).toFixed(2),
    badge: null,
    highlight: false,
    description: 'Para quem trabalha a tempo parcial ou quer mais flexibilidade.',
    features: [
      'Visibilidade no mapa durante 15 dias',
      'Partilha de localização em tempo real',
      'Perfil de vendedor completo',
      'Estatísticas avançadas de clientes',
      'Suporte prioritário',
      'Promoção de produtos',
      'Perfil personalizável',
    ],
    cta: 'Começar Quinzenal',
    color: 'var(--primary)',
  },
];

const FAQS = [
  { q: 'Posso cancelar quando quiser?', a: 'Sim. Podes cancelar a qualquer momento. O acesso mantém-se ativo até ao fim do período pago.' },
  { q: 'Como funciona o pagamento?', a: 'O pagamento é feito de forma segura via Stripe. Aceitamos cartões de crédito e débito.' },
  { q: 'Posso mudar de plano?', a: 'Sim, podes fazer upgrade ou downgrade entre planos a qualquer momento através do teu dashboard.' },
  { q: 'Existe algum período gratuito?', a: 'Oferecemos uma semana de demonstração para novos vendedores. Fala connosco no contacto para saber mais.' },
];

export default function PlansScreen({ auth, onClose }) {
  const { token, user, vendorId } = auth;
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePlanClick = async (planId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${BASE_URL}/vendors/${vendorId}/create-checkout-session?plan=${planId}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Não foi possível criar a sessão de pagamento');
      }

      const data = await response.json();
      if (data.checkout_url) {
        window.open(data.checkout_url, '_system');
      }
    } catch (err) {
      setError(err.message);
      console.error('Erro ao criar sessão de pagamento:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="plans-overlay">
      <div className="plans-sheet">
        <div className="plans-header">
          <h2>Planos de Subscrição</h2>
          <button className="btn-icon" onClick={onClose} title="Fechar">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {/* Hero section */}
        <div className="plans-hero">
          <div className="plans-hero-blur plans-hero-blur-1" />
          <div className="plans-hero-blur plans-hero-blur-2" />
          <h3 className="plans-hero-title">O teu negócio</h3>
          <p className="plans-hero-lead">
            Junta-te à plataforma que coloca os vendedores de praia no mapa, literalmente.
          </p>
        </div>

        {/* Pricing header */}
        <div className="plans-pricing-header">
          <span className="plans-pricing-eyebrow"><ZapIcon size={13} /> Planos e Preços</span>
          <h3 className="plans-pricing-title">Escolhe o plano certo para ti</h3>
          <p className="plans-pricing-sub">
            Sem surpresas. Sem taxas escondidas. Cancela quando quiseres.
          </p>
        </div>

        {/* Plans cards */}
        <div className="plans-container">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`plan-card${plan.highlight ? ' plan-card--highlight' : ''}`}
            >
              {plan.badge && (
                <div className="plan-badge">
                  <StarIcon size={11} /> {plan.badge}
                </div>
              )}

              <div className="plan-header">
                <h4 className="plan-label">{plan.label}</h4>
                <div className="plan-price">
                  <span className="plan-currency">€</span>
                  <span className="plan-amount">{plan.price.toFixed(2).replace('.', ',')}</span>
                  <span className="plan-period">/{plan.period}</span>
                </div>
                <p className="plan-per-day">≈ €{plan.pricePerDay.replace('.', ',')} por dia</p>
                {plan.highlight && (
                  <div className="plan-saving">
                    <TrendingUpIcon size={11} /> Poupa 58% vs plano semanal
                  </div>
                )}
              </div>

              <p className="plan-desc">{plan.description}</p>

              <ul className="plan-features">
                {plan.features.map((f) => (
                  <li key={f}>
                    <CheckIcon size={14} className="plan-check" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handlePlanClick(plan.id)}
                disabled={loading}
                className={`plan-cta${plan.highlight ? ' plan-cta--highlight' : ''}`}
              >
                {loading ? 'A processar…' : plan.cta}
              </button>
            </div>
          ))}
        </div>

        {/* Compare note */}
        <div className="plans-compare-note">
          <TrendingUpIcon size={15} />
          <span>
            Com o plano <strong>Mensal</strong> pagas apenas <strong>€0,83/dia</strong>, menos de um café,
            e tens visibilidade máxima durante todo o mês.
          </span>
        </div>

        {/* FAQ */}
        <div className="plans-faq-section">
          <h3 className="plans-faq-title">Perguntas frequentes</h3>
          <div className="plans-faq-list">
            {FAQS.map((faq) => (
              <details key={faq.q} className="plans-faq-item">
                <summary className="plans-faq-q">{faq.q}</summary>
                <p className="plans-faq-a">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
