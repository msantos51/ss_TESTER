import React from 'react';

// (em português) Ecrã de entrada da app do vendedor.
// A app é exclusiva para vendedores: aqui só se cria conta ou inicia sessão.
// A vista de mapa para banhistas vive no site, não na app.
const PROOFS = [
  { value: '2 min', label: 'a criar conta' },
  { value: '1 toque', label: 'para partilhar' },
  { value: 'GPS', label: 'em tempo real' },
];

export default function WelcomeScreen({ onLogin, onRegister }) {
  return (
    <div className="welcome-screen">
      {/* Halos de cor desfocados, puramente decorativos. */}
      <span className="welcome-halo welcome-halo-sun" aria-hidden="true" />
      <span className="welcome-halo welcome-halo-ocean" aria-hidden="true" />

      <div className="welcome-lead">
        <img src="/logo-icon.png" alt="Sunny Sales" className="welcome-logo" />
        <div>
          <h1 className="welcome-title">A praia<br />encontra-te.</h1>
          <p className="welcome-text">
            Liga a partilha e apareces no mapa para quem está na areia. Sem
            percorrer a praia toda à procura de clientes.
          </p>
        </div>
      </div>

      <div className="welcome-foot">
        <div className="welcome-proofs">
          {PROOFS.map((proof) => (
            <div className="welcome-proof" key={proof.value}>
              <span className="welcome-proof-value">{proof.value}</span>
              <span className="welcome-proof-label">{proof.label}</span>
            </div>
          ))}
        </div>

        <div className="welcome-actions">
          <button type="button" className="welcome-btn-primary" onClick={onRegister}>
            Criar conta de vendedor
          </button>
          <button type="button" className="welcome-btn-secondary" onClick={onLogin}>
            Já tenho conta
          </button>
        </div>

        <p className="welcome-note">Aplicação exclusiva para vendedores de praia.</p>
      </div>
    </div>
  );
}
