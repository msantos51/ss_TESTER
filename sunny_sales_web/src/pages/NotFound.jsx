import { Link } from 'react-router-dom';
import { FiHome, FiHelpCircle, FiMapPin } from 'react-icons/fi';
import './NotFound.css';

// (em português) Página apresentada quando a rota não existe.
export default function NotFound() {
  return (
    <div className="notfound">
      <div className="notfound-glow" aria-hidden="true" />
      <span className="notfound-icon" aria-hidden="true">
        <FiMapPin />
      </span>
      <p className="notfound-code">404</p>
      <h1 className="notfound-title">Página não encontrada</h1>
      <p className="notfound-text">
        A página que procuras não existe ou foi movida.
      </p>
      <div className="notfound-actions">
        <Link to="/" className="notfound-btn notfound-btn-primary">
          <FiHome size={16} />
          Voltar ao início
        </Link>
        <Link to="/faqs" className="notfound-btn notfound-btn-ghost">
          <FiHelpCircle size={16} />
          Perguntas frequentes
        </Link>
      </div>
    </div>
  );
}
