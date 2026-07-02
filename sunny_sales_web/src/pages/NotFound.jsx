import { Link } from 'react-router-dom';
import { FiHome, FiMapPin } from 'react-icons/fi';
import './NotFound.css';

// (em português) Página apresentada quando a rota não existe.
export default function NotFound() {
  return (
    <div className="notfound">
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
        <Link to="/map" className="notfound-btn notfound-btn-ghost">
          <FiMapPin size={16} />
          Explorar mapa
        </Link>
      </div>
    </div>
  );
}
