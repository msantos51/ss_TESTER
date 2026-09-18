import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { FiStar, FiCheck } from 'react-icons/fi';
import { BASE_URL, mediaUrl } from '../config';
import './AvaliarVendor.css';

// (em português) Página de avaliação — o destino do QR code pessoal de cada
// vendedor Premium. Quem lê o código chega aqui, escolhe de 1 a 5 estrelas e
// confirma. A média resultante aparece depois no cartão do vendedor no mapa.
//
// Não exige registo nem sessão: a barreira anti-abuso vive no backend, que
// limita cada avaliador a um voto por vendedor (ver create_review em main.py).

export default function AvaliarVendor() {
  const { vendorId } = useParams();
  const [vendor, setVendor] = useState(null);
  const [status, setStatus] = useState('loading'); // loading | ready | invalid | done
  const [hover, setHover] = useState(0);
  const [chosen, setChosen] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;
    axios
      .get(`${BASE_URL}/vendors/${vendorId}`)
      .then((res) => {
        if (!alive) return;
        // Só os vendedores Premium têm QR e recebem avaliações.
        if (!res.data?.is_premium) {
          setStatus('invalid');
          return;
        }
        setVendor(res.data);
        setStatus('ready');
      })
      .catch(() => {
        if (alive) setStatus('invalid');
      });
    return () => { alive = false; };
  }, [vendorId]);

  const submit = async () => {
    if (!chosen || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await axios.post(`${BASE_URL}/vendors/${vendorId}/reviews`, {
        rating: chosen,
      });
      setSummary(res.data);
      setStatus('done');
    } catch (err) {
      setError(
        err?.response?.status === 403
          ? 'Este vendedor já não aceita avaliações.'
          : 'Não foi possível registar a tua avaliação. Tenta de novo.'
      );
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
