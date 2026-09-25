import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FiStar, FiCheck } from 'react-icons/fi';
import { BASE_URL, mediaUrl } from '../config';
import './AvaliarVendor.css';

// (em português) Página de avaliação — destino do QR code pessoal de cada
// vendedor Premium. O QR code impresso aponta para /avaliar/{id} (URL estático,
// permanente). Ao abrir o URL, a página pede automaticamente um token de uso
// único ao backend (POST /review-token, validade 20 min) e guarda-o em
// sessionStorage. Assim:
//   • Cada leitura do QR gera uma nova oportunidade de avaliação.
//   • Refrescar a página antes de avaliar: usa o mesmo token (sessionStorage).
//   • Refrescar depois de avaliar: token já consumido → "QR já utilizado".
//   • Cada dispositivo avalia cada vendedor uma vez (marca em localStorage):
//     voltar a ler o QR no mesmo telemóvel mostra "Já avaliaste".

const SESSION_KEY = (vendorId) => `ss_review_token_${vendorId}`;
const RATED_KEY = (vendorId) => `ss_rated_${vendorId}`;

export default function AvaliarVendor() {
  const { vendorId } = useParams();

  const [vendor, setVendor] = useState(null);
  const [token, setToken] = useState(null);
  // loading | ready | rated | used | invalid | error | done
  const [status, setStatus] = useState('loading');
  // Incrementar volta a correr o carregamento (botão "Tentar de novo").
  const [attempt, setAttempt] = useState(0);
  const [hover, setHover] = useState(0);
  const [chosen, setChosen] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    const init = async () => {
      // Se este dispositivo já avaliou este vendedor, mostrar mensagem sem pedir token.
      try {
        if (localStorage.getItem(RATED_KEY(vendorId))) { setStatus('rated'); return; }
      } catch { /* privado */ }

      // Tentar reutilizar o token desta sessão de browser.
      let sessionToken = null;
      try { sessionToken = sessionStorage.getItem(SESSION_KEY(vendorId)); } catch { /* privado */ }

      try {
        // Carregar dados do vendedor em paralelo com a obtenção/validação do token.
        const [vendorRes] = await Promise.all([
          axios.get(`${BASE_URL}/vendors/${vendorId}`),
        ]);
        if (!alive) return;
        setVendor(vendorRes.data);

        if (!sessionToken) {
          // Primeira abertura desta página neste separador: pedir token fresco.
          const tokenRes = await axios.post(`${BASE_URL}/vendors/${vendorId}/review-token`);
          if (!alive) return;
          sessionToken = tokenRes.data.token;
          try { sessionStorage.setItem(SESSION_KEY(vendorId), sessionToken); } catch { /* privado */ }
        }

        setToken(sessionToken);
        setStatus('ready');
      } catch (err) {
        if (!alive) return;
        const code = err?.response?.status;
        // Só um 404 quer dizer que o vendedor não existe; sem resposta (rede
        // da praia) ou com erro do servidor, vale a pena tentar outra vez.
        if (code === 410) setStatus('used');
        else if (code === 404 || code === 422) setStatus('invalid');
        else setStatus('error');
      }
    };

    setStatus('loading');
    init();
    return () => { alive = false; };
  }, [vendorId, attempt]);

  const submit = async () => {
    if (!chosen || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await axios.post(
        `${BASE_URL}/vendors/${vendorId}/reviews`,
        { rating: chosen },
        { params: { t: token } },
      );
      // Token consumido — limpar da sessão e marcar dispositivo como "já avaliou".
      try { sessionStorage.removeItem(SESSION_KEY(vendorId)); } catch { /* privado */ }
      try { localStorage.setItem(RATED_KEY(vendorId), '1'); } catch { /* privado */ }
      setSummary(res.data);
      setStatus('done');
    } catch (err) {
      const code = err?.response?.status;
      if (code === 410) {
        try { sessionStorage.removeItem(SESSION_KEY(vendorId)); } catch { /* privado */ }
        setStatus('used');
      } else {
        setError(
          code === 403
            ? 'Este vendedor já não aceita avaliações.'
            : 'Não foi possível registar a tua avaliação. Tenta de novo.',
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="rate-page">
        <p className="rate-status" role="status">A carregar…</p>
      </div>
    );
  }

  if (status === 'rated') {
    return (
      <div className="rate-page">
        <div className="rate-card">
          <div className="rate-done-icon" aria-hidden="true"><FiCheck size={28} /></div>
          <h1 className="rate-title">Já avaliaste</h1>
          <p className="rate-lead">
            Já deixaste a tua avaliação a este vendedor neste telemóvel.
            Obrigado!
          </p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="rate-page">
        <div className="rate-card">
          <h1 className="rate-title">Sem ligação</h1>
          <p className="rate-lead">
            Não foi possível carregar a avaliação. Verifica a ligação à
            internet e tenta de novo.
          </p>
          <button
            type="button"
            className="rate-submit"
            onClick={() => setAttempt((n) => n + 1)}
          >
            Tentar de novo
          </button>
        </div>
      </div>
    );
  }

  if (status === 'used') {
    return (
      <div className="rate-page">
        <div className="rate-card">
          <h1 className="rate-title">QR code já utilizado</h1>
          <p className="rate-lead">
            Este código de avaliação já foi usado ou expirou. Lê o QR code do
            vendedor outra vez para avaliares.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'invalid') {
    return (
      <div className="rate-page">
        <div className="rate-card">
          <h1 className="rate-title">Avaliação indisponível</h1>
          <p className="rate-lead">
            Este vendedor não está disponível para avaliações neste momento.
          </p>
        </div>
      </div>
    );
  }

  if (status === 'done') {
    return (
      <div className="rate-page">
        <div className="rate-card">
          <div className="rate-done-icon" aria-hidden="true"><FiCheck size={28} /></div>
          <h1 className="rate-title">Obrigado!</h1>
          <p className="rate-lead">
            A tua avaliação de <strong>{chosen}</strong>{' '}
            {chosen === 1 ? 'estrela' : 'estrelas'} foi registada.
          </p>
          {vendor?.is_premium && summary?.average != null && (
            <p className="rate-average">
              <FiStar size={16} aria-hidden="true" />
              <span>
                Média atual <strong>{summary.average.toFixed(1)}</strong>
                {' '}({summary.count}{' '}
                {summary.count === 1 ? 'avaliação' : 'avaliações'})
              </span>
            </p>
          )}
        </div>
      </div>
    );
  }

  const active = hover || chosen;

  return (
    <div className="rate-page">
      <div className="rate-card">
        <div className="rate-head">
          {vendor.profile_photo ? (
            <img
              src={mediaUrl(vendor.profile_photo)}
              alt={vendor.name}
              className="rate-photo"
            />
          ) : (
            <div
              className="rate-photo rate-photo--placeholder"
              style={{ background: vendor.pin_color || '#1D5C3A' }}
            />
          )}
          <div>
            <h1 className="rate-title">Avaliar {vendor.name}</h1>
            {vendor.product && <p className="rate-sub">{vendor.product}</p>}
          </div>
        </div>

        <p className="rate-lead">Quantas estrelas dás a este vendedor?</p>

        <div
          className="rate-stars"
          role="radiogroup"
          aria-label="Classificação de 1 a 5 estrelas"
          onMouseLeave={() => setHover(0)}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={chosen === n}
              aria-label={`${n} ${n === 1 ? 'estrela' : 'estrelas'}`}
              className={`rate-star${n <= active ? ' is-on' : ''}`}
              onMouseEnter={() => setHover(n)}
              onFocus={() => setHover(n)}
              onBlur={() => setHover(0)}
              onClick={() => setChosen(n)}
            >
              <FiStar size={40} />
            </button>
          ))}
        </div>

        {error && <p className="rate-error" role="alert">{error}</p>}

        <button
          type="button"
          className="rate-submit"
          onClick={submit}
          disabled={!chosen || submitting}
        >
          {submitting ? 'A enviar…' : 'Confirmar avaliação'}
        </button>
      </div>
    </div>
  );
}
