import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { FiSun, FiInfo, FiHelpCircle, FiMail, FiMenu, FiX } from 'react-icons/fi';
import { FaInstagram } from 'react-icons/fa';
import { lazy, Suspense, useCallback, useState, useEffect } from 'react';
import Landing from './pages/Landing';
import BackHomeButton from './components/BackHomeButton';
import Footer from './components/Footer';
import MobileMenu from './components/MobileMenu';
import ScrollToTop from './components/ScrollToTop';
import PageMeta from './components/PageMeta';
import LoadingDots from './components/LoadingDots';
import useScrollReveal from './hooks/useScrollReveal';
import './index.css';

// (em português) O site é dedicado exclusivamente ao banhista: uma página de
// entrada que explica o serviço, o mapa em /mapa e um punhado de páginas
// informativas. Não há área de vendedor, nem início de sessão ou criação de
// conta.
// As restantes páginas são carregadas sob demanda (code-splitting) para reduzir
// o tamanho do bundle inicial. Apenas a Landing é carregada de imediato; o
// ecrã do mapa, com toda a lógica de GPS, bússola e WebSocket, só chega a
// quem abre /mapa.
const Home = lazy(() => import('./pages/Home'));
const SobreProjeto = lazy(() => import('./pages/SobreProjeto'));
const Sustentabilidade = lazy(() => import('./pages/Sustentabilidade'));
const Contacto = lazy(() => import('./pages/Contacto'));
const FAQ = lazy(() => import('./pages/FAQ'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const LegalNotice = lazy(() => import('./pages/LegalNotice'));
const CookiesPolicy = lazy(() => import('./pages/CookiesPolicy'));
const AccountDeletion = lazy(() => import('./pages/AccountDeletion'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Rotas sem botão de voltar global: a página de entrada e o mapa, que têm UI
// própria.
const HIDE_BACK_ROUTES = ['/', '/mapa'];

// Os destinos do site, numa lista só: em desktop vivem dentro da cápsula de
// vidro, em telemóvel na folha do menu hamburger. O mapa não está aqui porque
// tem o seu próprio CTA na cápsula, visível em qualquer largura. O ícone só é
// usado na folha do menu (na cápsula o rótulo chega).
const DESTINATIONS = [
  { to: '/sustentabilidade', label: 'Praia Sustentável', Icon: FiSun },
  { to: '/sobre-projeto', label: 'Sobre o Projeto', Icon: FiInfo },
  { to: '/faqs', label: 'FAQs', Icon: FiHelpCircle },
  { to: '/contacto', label: 'Contacto', Icon: FiMail },
];

function PageLoader() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0' }}>
      <LoadingDots />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <PageMeta />
      <AppLayout />
    </Router>
  );
}

function AppLayout() {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Revelação suave dos elementos .reveal ao entrarem no ecrã.
  useScrollReveal();

  // O menu de telemóvel não sobrevive a uma mudança de página: os links já o
  // fecham, isto cobre a navegação pelo histórico (o botão "voltar").
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Em desktop o botão do menu não existe; se o ecrã crescer com o menu
  // aberto, a folha ficava presa e o scroll da página bloqueado.
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 769px)');
    const onChange = (event) => {
      if (event.matches) setMenuOpen(false);
    };
    desktop.addEventListener('change', onChange);
    return () => desktop.removeEventListener('change', onChange);
  }, []);

  // A cápsula de vidro fica mais densa assim que há conteúdo a correr
  // por baixo dela.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Em /mapa o mapa é o conteúdo. Em telemóvel o cromo fixo (navbar + rodapé)
  // custava 114px de altura sobre um mapa que é a única coisa que o visitante
  // veio ver — ver `.wrapper--map` em index.css.
  const isMapRoute = location.pathname === '/mapa';

  // Salta o foco diretamente para o conteúdo. Faz-se em JS (preventDefault +
  // scroll manual) para não deixar o "#conteudo" no URL nem interferir com o
  // router.
  const skipToContent = (e) => {
    e.preventDefault();
    const el = document.getElementById('conteudo');
    if (el) {
      el.focus({ preventScroll: true });
      el.scrollIntoView();
    }
  };

  return (
    <div className={`wrapper${isMapRoute ? ' wrapper--map' : ''}`}>
      <a href="#conteudo" className="skip-link" onClick={skipToContent}>
        Saltar para o conteúdo
      </a>
      <nav
        className={`navbar${scrolled ? ' navbar--scrolled' : ''}`}
        aria-label="Navegação principal"
      >
        <Link className="nav-logo" to="/">
          {/* alt vazio: o texto "Sunny Sales" ao lado já identifica o link.
              Versão 68px do logótipo (2×) — o original só é usado como
              favicon/og:image. */}
          <img
            src="/logosite-nav.png"
            alt=""
            width="34"
            height="34"
            className="nav-logo-img"
          />
          {/* Em ecrãs muito estreitos o nome sai de vista (mas não do DOM:
              é o nome acessível deste link) — ver index.css. */}
          <span className="nav-logo-text">Sunny Sales</span>
        </Link>

        {/* Em desktop os destinos vivem aqui dentro; em telemóvel esta lista
            sai e os mesmos destinos aparecem na folha do menu. */}
        <div className="nav-links">
          {DESTINATIONS.map(({ to, label }) => (
            <NavLink
              key={to}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              to={to}
            >
              {label}
            </NavLink>
          ))}
        </div>

        <Link to="/mapa" className="nav-cta-map">
          <span className="nav-cta-dot" aria-hidden="true" />
          Abrir mapa
        </Link>

        {/* Em telemóvel o Instagram passa para a folha do menu (index.css). */}
        <div className="nav-icons">
          <a
            href="https://www.instagram.com/sunny.sales_official/"
            target="_blank"
            rel="noopener noreferrer"
            className="profile-icon"
            aria-label="Instagram"
          >
            <FaInstagram size={18} />
          </a>
        </div>

        {/* Só existe em telemóvel (≤768px): abre a folha com os destinos. */}
        <button
          type="button"
          className="nav-burger"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={menuOpen}
          aria-controls="nav-menu"
        >
          {menuOpen ? (
            <FiX size={22} aria-hidden="true" />
          ) : (
            <FiMenu size={22} aria-hidden="true" />
          )}
        </button>
      </nav>

      {/* A folha não pode viver dentro da cápsula: o backdrop-filter do vidro
          faz dela o bloco de referência de tudo o que é `position: fixed` lá
          dentro, e a folha deixaria de se posicionar em relação ao ecrã. */}
      <MobileMenu
        open={menuOpen}
        destinations={DESTINATIONS}
        onClose={closeMenu}
      />

      <div className="container" role="main" id="conteudo" tabIndex={-1}>
        {!HIDE_BACK_ROUTES.includes(location.pathname) && <BackHomeButton />}
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/mapa" element={<Home />} />
          {/* /map continua a existir como redirect para não deixar links
              antigos num beco sem saída. */}
          <Route path="/map" element={<Navigate to="/mapa" replace />} />
          <Route path="/sustentabilidade" element={<Sustentabilidade />} />
          <Route path="/sobre-projeto" element={<SobreProjeto />} />
          <Route path="/faqs" element={<FAQ />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/legal-notice" element={<LegalNotice />} />
          <Route path="/cookies-policy" element={<CookiesPolicy />} />
          {/* Exigida pela Google Play: eliminação de conta acessível
              fora da app, para quem já a desinstalou. */}
          <Route path="/eliminar-conta" element={<AccountDeletion />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </div>
      {/* Em /mapa o mapa é ecrã cheio: o rodapé sairia de qualquer forma em
          telemóvel e em desktop só roubava altura ao mapa. */}
      {!isMapRoute && <Footer />}
    </div>
  );
}
