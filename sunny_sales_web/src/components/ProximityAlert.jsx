import React, { useState } from 'react';
import axios from 'axios';
import { FiBell, FiCheck } from 'react-icons/fi';
import { BASE_URL } from '../config';
import './ProximityAlert.css';

// (em português) Aviso de proximidade: o banhista deixa o email e é avisado
// quando este vendedor entrar na zona onde está agora. É uma vantagem Premium,
// por isso o bloco só aparece nos vendedores que a têm — quem o decide é o
// servidor (`is_premium` em GET /vendors/), que também recusa o registo para
// os outros.
//
// Sem posição não há zona que se possa medir, e é por isso que o bloco pede
// a localização em vez de aceitar o email: um aviso que nunca chegaria seria
// pior do que não o oferecer.
export default function ProximityAlert({ vendor, clientPos }) {
  const [email, setEmail] = useState('');
  const [state, setState] = useState('idle'); // idle | sending | done | error
  const [message, setMessage] = useState('');

  if (!vendor?.is_premium) return null;

  if (!clientPos) {
    return (
      <div className="proximity-alert">
        <div className="proximity-alert-head">
          <FiBell size={13} />
          <span>Avisa-me quando chegar</span>
        </div>
        <p className="proximity-alert-hint">
          Ativa a localização para podermos saber quando {vendor.name} entra na tua zona.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setState('sending');
    setMessage('');
    try {
      const res = await axios.post(`${BASE_URL}/vendors/${vendor.id}/interest`, {
        email: email.trim(),
        lat: clientPos.lat,
        lng: clientPos.lng,
      });
      setState('done');
      setMessage(res.data?.detail || 'Avisamos-te quando este vendedor chegar perto.');
    } catch (err) {
      setState('error');
      setMessage(
        err.response?.data?.detail || 'Não foi possível registar o aviso. Tenta outra vez.'
      );
    }
  };

  if (state === 'done') {
    return (
      <div className="proximity-alert is-done">
        <div className="proximity-alert-head">
          <FiCheck size={13} />
          <span>Aviso ativo</span>
        </div>
        <p className="proximity-alert-hint">{message}</p>
      </div>
    );
  }

  return (
    <form className="proximity-alert" onSubmit={handleSubmit}>
      <div className="proximity-alert-head">
        <FiBell size={13} />
        <span>Avisa-me quando chegar</span>
      </div>
      <div className="proximity-alert-row">
        <input
          type="email"
          className="proximity-alert-input"
          placeholder="O teu email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          aria-label="Email para o aviso de proximidade"
          required
        />
        <button type="submit" className="proximity-alert-btn" disabled={state === 'sending'}>
          {state === 'sending' ? 'A registar…' : 'Avisar'}
        </button>
      </div>
      {state === 'error' && <p className="proximity-alert-error">{message}</p>}
      <p className="proximity-alert-hint">
        No máximo dois avisos por dia. Cada email traz um link para cancelar.
      </p>
    </form>
  );
}
