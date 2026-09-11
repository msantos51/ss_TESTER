import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
  Navigate,
  useLocation,
} from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { FaInstagram } from 'react-icons/fa';
import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import Landing from './pages/Landing';
import BackHomeButton from './components/BackHomeButton';
import Footer from './components/Footer';
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
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navLinksRef = useRef(null);

  // Revelação suave dos elementos .reveal ao entrarem no ecrã.
  useScrollReveal();

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // Navbar sem fundo sobre o hero da página inicial; ganha fundo ao rolar.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [menuOpen]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

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
          Sunny Sales
        </Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`} ref={navLinksRef}>
          {/* Em desktop o mapa é o CTA preto à direita; em telemóvel esse
              botão não cabe ao lado do logótipo, do Instagram e do hamburger,
              por isso entra aqui como primeiro item do menu. */}
          <NavLink
            className={({ isActive }) =>
              `nav-link nav-link--map${isActive ? ' active' : ''}`
            }
            to="/mapa"
          >
            Abrir mapa
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            to="/sustentabilidade"
          >
            Praia Sustentável
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            to="/sobre-projeto"
          >
            Sobre o Projeto
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            to="/faqs"
          >
            FAQs
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            to="/contacto"
          >
            Contacto
          </NavLink>
        </div>

        <Link to="/mapa" className="nav-cta-map">
          <span className="nav-cta-dot" aria-hidden="true" />
          Abrir mapa
        </Link>

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
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FiX size={22} /> : <FiMenu size={22} />}
          </button>
        </div>
      </nav>

      {/* Backdrop overlay for mobile menu */}
      <div
        className={`nav-overlay${menuOpen ? ' visible' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
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
