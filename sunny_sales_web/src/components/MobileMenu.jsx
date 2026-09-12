import { useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { FaInstagram } from 'react-icons/fa';
import './MobileMenu.css';

// (em português) A folha de navegação do telemóvel, aberta pelo botão de menu
// da cápsula de vidro. Leva os mesmos destinos que em desktop vivem dentro da
// cápsula — a lista chega por `destinations`, de App.jsx, para não haver duas
// fontes de verdade.
//
// É modal: tapa o conteúdo da página, por isso escurece o fundo, prende o foco
// lá dentro, fecha com Escape e devolve o foco a quem a abriu. A cápsula fica
// por cima do fundo escurecido (z-index 1100 contra 1050) porque é lá que está
// o botão que a fecha.
export default function MobileMenu({ open, destinations, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    const panel = panelRef.current;
    const previouslyFocused = document.activeElement;
    const focusables = () =>
      panel.querySelectorAll('a[href], button:not([disabled])');

    // O foco entra na folha (e não no primeiro destino: o anel de foco à
    // volta dele lia-se como "estás nesta página"). O leitor de ecrã anuncia
    // o diálogo e o primeiro Tab entra na lista.
    panel.focus();

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;
      // O Tab circula dentro da folha: fora dela está conteúdo tapado.
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const current = document.activeElement;
      if (event.shiftKey && (current === first || current === panel)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && current === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    // A página não rola por baixo da folha.
    const bodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = bodyOverflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Decorativo: fechar também se faz com Escape e com o próprio botão do
          menu, por isso o fundo não precisa de ser alcançável por teclado. */}
      <div className="nav-menu-backdrop" onClick={onClose} aria-hidden="true" />
      <div
        id="nav-menu"
        ref={panelRef}
        className="nav-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu de navegação"
        tabIndex={-1}
      >
        {destinations.map((dest) => (
          <NavLink
            key={dest.to}
            to={dest.to}
            onClick={onClose}
            className={({ isActive }) =>
              `nav-menu-link${isActive ? ' active' : ''}`
            }
          >
            <span className="nav-menu-icon" aria-hidden="true">
              <dest.Icon size={19} />
            </span>
            {dest.label}
          </NavLink>
        ))}

        <span className="nav-menu-divider" aria-hidden="true" />

        <a
          href="https://www.instagram.com/sunny.sales_official/"
          target="_blank"
          rel="noopener noreferrer"
          className="nav-menu-link"
          onClick={onClose}
        >
          <span className="nav-menu-icon" aria-hidden="true">
            <FaInstagram size={18} />
          </span>
          Instagram
        </a>
      </div>
    </>
  );
}
