// (em português) Componente de pop-up de boas-vindas com mensagem mais concisa
import './WelcomePopup.css';

export default function WelcomePopup({ onClose }) {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="popup-close" onClick={onClose} aria-label="Fechar">
          &times;
        </button>
        <h2>Bem-vindo à Sunny Sales!</h2>
        <p>
          Veja em tempo real onde estão os vendedores de praia.
        </p>
        <p>
          📍 Mapa com vendedores ativos
          <br />
          🛍️ Filtro por tipo de produto
        </p>
        <p><strong>Sem necessidade de registo!</strong></p>
      </div>
    </div>
  );
}
