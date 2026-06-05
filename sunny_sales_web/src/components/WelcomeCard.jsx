import { FiMapPin, FiNavigation, FiFilter, FiSun } from 'react-icons/fi';
import './WelcomeCard.css';

export default function WelcomeCard({ onClose }) {
  return (
    <div className="welcome-overlay" onClick={onClose}>
      <div className="welcome-card" onClick={(e) => e.stopPropagation()}>
        <div className="welcome-header">
          <span className="welcome-icon"><FiSun size={32} /></span>
          <h2 className="welcome-title">Bem-vindo ao Sunny Sales</h2>
          <p className="welcome-subtitle">Encontra os vendedores de praia mais perto de ti</p>
        </div>

        <ul className="welcome-steps">
          <li>
            <span className="welcome-step-icon"><FiNavigation size={18} /></span>
            <div>
              <strong>Ativa a tua localização</strong>
              <span>Clica no botão de localização para veres os vendedores próximos em tempo real.</span>
            </div>
          </li>
          <li>
            <span className="welcome-step-icon"><FiMapPin size={18} /></span>
            <div>
              <strong>Explora o mapa</strong>
              <span>Cada ponto no mapa é um vendedor ativo. Toca para veres mais detalhes.</span>
            </div>
          </li>
          <li>
            <span className="welcome-step-icon"><FiFilter size={18} /></span>
            <div>
              <strong>Filtra o que queres</strong>
              <span>Usa os filtros para encontrar o teu vendedor favorito por produto ou distância.</span>
            </div>
          </li>
        </ul>

        <button className="welcome-btn" onClick={onClose}>
          Explorar o Mapa
        </button>
      </div>
    </div>
  );
}
