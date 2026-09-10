import React from 'react';
import { FiMapPin, FiNavigation, FiUserPlus } from 'react-icons/fi';

// (em português) Ecrã de entrada da app do vendedor.
// A app é exclusiva para vendedores: aqui só se cria conta ou inicia sessão.
// A vista de mapa para banhistas vive no site, não na app.
export default function WelcomeScreen({ onLogin, onRegister }) {
  const benefits = [
    {
      icon: <FiUserPlus />,
      title: 'Regista-te em minutos',
      desc: 'Cria a tua conta de vendedor diretamente no telemóvel.',
    },
    {
      icon: <FiNavigation />,
      title: 'Partilha a localização',
      desc: 'Com um toque começas a emitir a tua posição em tempo real.',
    },
    {
      icon: <FiMapPin />,
      title: 'Sê encontrado na praia',
      desc: 'Os banhistas veem-te no mapa do site enquanto partilhas.',
    },
  ];

  return (
    <div className="screen welcome-screen">
      <div className="login-header">
        <div className="logo-circle">
          <svg viewBox="0 0 64 64" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="32" cy="32" r="32" fill="white" fillOpacity="0.15" />
            <path d="M32 16 L20 40 L32 34 L44 40 Z" fill="white" />
          </svg>
        </div>
        <h1 className="app-title">Sunny Sales</h1>
        <p className="app-subtitle">App do Vendedor</p>
      </div>

      <div className="welcome-card">
        <ul className="welcome-benefits">
          {benefits.map((benefit) => (
            <li className="welcome-benefit" key={benefit.title}>
              <span className="welcome-benefit-icon">{benefit.icon}</span>
              <span className="welcome-benefit-text">
                <strong>{benefit.title}</strong>
                <small>{benefit.desc}</small>
              </span>
            </li>
          ))}
        </ul>

        <button type="button" className="btn btn-primary" onClick={onRegister}>
          Criar conta de vendedor
        </button>
        <button type="button" className="btn btn-secondary" onClick={onLogin}>
          Já tenho conta
        </button>
      </div>

      <p className="welcome-foot">
        Esta aplicação destina-se apenas a vendedores de praia.
      </p>
    </div>
  );
}
