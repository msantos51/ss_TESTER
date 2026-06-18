import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiCheck, FiZap, FiStar, FiTrendingUp } from 'react-icons/fi';
import BackHomeButton from '../components/BackHomeButton';
import { BASE_URL } from '../config';
import './PlanosVendedores.css';

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
      'Criação de rota personalizada',
      'Perfil de vendedor completo',
      'Suporte por email',
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
      'Criação de rota personalizada',
      'Perfil de vendedor completo',
      'Estatísticas avançadas de visitas',
      'Stories de produtos (fotos e vídeos)',
      'Suporte prioritário',
      'Faturação simplificada',
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
      'Criação de rota personalizada',
      'Perfil de vendedor completo',
      'Estatísticas básicas de visitas',
      'Suporte por email',
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

export default function PlanosVendedores() {
  const navigate = useNavigate();

  const handlePlanClick = async (e, planId) => {
    e.preventDefault();
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token) {
      const vendor = JSON.parse(user);
      try {
        const { data } = await axios.post(
          `${BASE_URL}/vendors/${vendor.id}/create-checkout-session`,
          null,
          { params: { plan: planId }, headers: { Authorization: `Bearer ${token}` } }
        );
        window.open(data.checkout_url, '_blank');
      } catch (err) {
        console.error('Erro ao criar sessão de pagamento:', err);
      }
    } else {
      navigate('/vendor-login');
    }
  };

  return (
    <div className="pv-page">
      <BackHomeButton />

      {/* ── Hero ── */}
      <div className="pv-hero">
        <div className="pv-hero-blur pv-hero-blur-1" />
        <div className="pv-hero-blur pv-hero-blur-2" />
        <h1 className="pv-hero-title">O teu negócio</h1>
        <p className="pv-hero-lead">
          Junta-te à plataforma que coloca os vendedores de praia no mapa,
          literalmente. Mais visibilidade, mais clientes, mais vendas.
        </p>
      </div>

      {/* ── Pricing header ── */}
      <div className="pv-pricing-header">
        <span className="pv-pricing-eyebrow"><FiZap size={14} /> Planos e Preços</span>
        <h2 className="pv-pricing-title">Escolhe o plano certo para ti</h2>
        <p className="pv-pricing-sub">
          Sem surpresas. Sem taxas escondidas. Cancela quando quiseres.
        </p>
      </div>

      {/* ── Plans grid ── */}
      <div className="pv-plans">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`pv-plan-card${plan.highlight ? ' pv-plan-card--highlight' : ''}`}
          >
            {plan.badge && (
              <div className="pv-plan-badge">
                <FiStar size={12} /> {plan.badge}
              </div>
            )}

            <div className="pv-plan-header">
              <h3 className="pv-plan-label">{plan.label}</h3>
              <div className="pv-plan-price">
                <span className="pv-plan-currency">€</span>
                <span className="pv-plan-amount">{plan.price.toFixed(2).replace('.', ',')}</span>
                <span className="pv-plan-period">/{plan.period}</span>
              </div>
              <p className="pv-plan-per-day">≈ €{plan.pricePerDay.replace('.', ',')} por dia</p>
              {plan.highlight && (
                <div className="pv-plan-saving">
                  <FiTrendingUp size={12} /> Poupa 58% vs plano semanal
                </div>
              )}
            </div>

            <p className="pv-plan-desc">{plan.description}</p>

            <ul className="pv-plan-features">
              {plan.features.map((f) => (
                <li key={f}>
                  <FiCheck size={15} className="pv-plan-check" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={(e) => handlePlanClick(e, plan.id)}
              className={`pv-plan-cta${plan.highlight ? ' pv-plan-cta--highlight' : ''}`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      {/* ── Comparison note ── */}
      <div className="pv-compare-note">
        <FiTrendingUp size={16} />
        <span>
          Com o plano <strong>Mensal</strong> pagas apenas <strong>€0,83/dia</strong>, menos de um café,
          e tens visibilidade máxima durante todo o mês.
        </span>
      </div>

      {/* ── FAQ ── */}
      <div className="pv-faq-section">
        <h2 className="pv-faq-title">Perguntas frequentes</h2>
        <div className="pv-faq-list">
          {FAQS.map((faq) => (
            <details key={faq.q} className="pv-faq-item">
              <summary className="pv-faq-q">{faq.q}</summary>
              <p className="pv-faq-a">{faq.a}</p>
            </details>
          ))}
        </div>
      </div>


    </div>
  );
}
