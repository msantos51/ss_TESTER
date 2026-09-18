import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { FiStar, FiCheck } from 'react-icons/fi';
import { BASE_URL, mediaUrl } from '../config';
import './AvaliarVendor.css';

// (em português) Página de avaliação — o destino do QR code pessoal de cada
// vendedor Premium. O acesso exige um token de uso único (`?t=…`) gerado pelo
// backend ao servir o qr.png. Sem token, ou com token já utilizado/expirado,
// a página mostra um ecrã de erro — nunca o formulário.

export default function AvaliarVendor() {
  const { vendorId } = useParams();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('t');

  const [vendor, setVendor] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | invalid | used | done
  const [hover, setHover] = useState(0);
  const [chosen, setChosen] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Sem token no URL → não veio de um QR scan, bloquear imediatamente.
    if (!token) {
      setStatus('invalid');
      return;
    }

    let alive = true;

    // Valida o token e carrega os dados do vendedor em paralelo.
    Promise.all([
      axios.get(`${BASE_URL}/vendors/${vendorId}/check-token`, { params: { t: token } }),
      axios.get(`${BASE_URL}/vendors/${vendorId}`),
    ])
      .then(([, vendorRes]) => {
        if (!alive) return;
        if (!vendorRes.data?.is_premium) {
          setStatus('invalid');
          return;
        }
        setVendor(vendorRes.data);
        setStatus('ready');
      })
      .catch((err) => {
        if (!alive) return;
        const code = err?.response?.status;
        // 410 = token já usado ou expirado
        setStatus(code === 410 ? 'used' : 'invalid');
      });

    return () => { alive = false; };
  }, [vendorId, token]);

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
      setSummary(res.data);
      setStatus('done');
    } catch (err) {
      const code = err?.response?.status;
      if (code === 410) {
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

  if (status === 'used') {
    return (
      <div className="rate-page">
        <div className="rate-card">
          <h1 className="rate-title">QR code já utilizado</h1>
          <p className="rate-lead">
            Este código já foi usado para uma avaliação. Para avaliar de novo,
            pede ao vendedor que gere um novo QR code.
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
            Este código já não está ativo ou o vendedor não está disponível para
            avaliações neste momento.
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
          {summary?.average != null && (
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
