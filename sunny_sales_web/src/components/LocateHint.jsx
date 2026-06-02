import './LocateHint.css';

export default function LocateHint({ onClose }) {
  return (
    <div className="locate-hint">
      <div className="locate-hint__bubble">
        Clica aqui para encontrar os vendedores próximos de ti
        <button className="locate-hint__close" onClick={onClose} aria-label="Fechar">
          &times;
        </button>
      </div>
    </div>
  );
}
