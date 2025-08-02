import './WelcomePopup.css';

export default function WelcomePopup({ onClose }) {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="popup-close" onClick={onClose} aria-label="Fechar">
          &times;
        </button>
        <h2>🌞 Bem-vindo à Sunny Sales!</h2>
        <p>
          A Sunny Sales é uma plataforma inovadora que mostra em tempo real onde
          estão os vendedores de praia — como os que vendem bolas de Berlim,
          gelados e acessórios de verão.
        </p>
        <p>
          📍 Veja no mapa os vendedores ativos
          <br />
          🛍️ Filtre por produto que procura
        </p>
        <p>Não precisa de se registar!</p>
      </div>
    </div>
  );
}
