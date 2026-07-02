import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// (em português) O HashRouter mantém a posição de scroll entre páginas.
// Este componente repõe o scroll no topo sempre que a rota muda.
export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
