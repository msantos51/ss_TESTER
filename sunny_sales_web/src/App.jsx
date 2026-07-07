import {
  HashRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
  useLocation,
} from 'react-router-dom';
import { FiUser, FiMenu, FiX, FiMapPin } from 'react-icons/fi';
import { FaInstagram } from 'react-icons/fa';
import { lazy, Suspense, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BASE_URL } from './config';
import Home from './pages/Home';
import BackHomeButton from './components/BackHomeButton';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import LoadingDots from './components/LoadingDots';
import './index.css';

// (em português) As restantes páginas são carregadas sob demanda (code-splitting)
// para reduzir o tamanho do bundle inicial. Apenas a Home é carregada de imediato.
const About = lazy(() => import('./pages/About'));
const AccountSettings = lazy(() => import('./pages/AccountSettings'));
const VendorLogin = lazy(() => import('./pages/VendorLogin'));
const ManageAccount = lazy(() => import('./pages/ManageAccount'));
const PaidWeeksScreen = lazy(() => import('./pages/PaidWeeksScreen.jsx'));
const VendorRegister = lazy(() => import('./pages/VendorRegister'));
const RouteDetail = lazy(() => import('./pages/RouteDetail'));
const RoutesScreen = lazy(() => import('./pages/RoutesScreen'));
const ProductsScreen = lazy(() => import('./pages/ProductsScreen'));
const StatsScreen = lazy(() => import('./pages/StatsScreen'));
const TermsScreen = lazy(() => import('./pages/TermsScreen'));
const VendorDetailScreen = lazy(() => import('./pages/VendorDetailScreen'));
const Invoices = lazy(() => import('./pages/Invoices'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ModernMapLayout = lazy(() => import('./pages/ModernMapLayout'));
const SobreProjeto = lazy(() => import('./pages/SobreProjeto'));
const Sustentabilidade = lazy(() => import('./pages/Sustentabilidade'));
const HowItWorks = lazy(() => import('./pages/HowItWorks'));
const Sessions = lazy(() => import('./pages/Sessions'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Contacto = lazy(() => import('./pages/Contacto'));
const PlanosVendedores = lazy(() => import('./pages/PlanosVendedores'));
const FAQ = lazy(() => import('./pages/FAQ'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));
const LegalNotice = lazy(() => import('./pages/LegalNotice'));
const CookiesPolicy = lazy(() => import('./pages/CookiesPolicy'));
const NotFound = lazy(() => import('./pages/NotFound'));

// Rotas sem botão de voltar global: página inicial, mapa (tem UI própria),
// dashboard (tem navegação interna) e páginas de autenticação.
const HIDE_BACK_ROUTES = [
  '/',
  '/map',
  '/dashboard',
  '/login',
  '/vendor-login',
  '/register',
  '/vendor-register',
  '/forgot-password',
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
      <AppLayout />
    </Router>
  );
}

function AppLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('user'));
  const navLinksRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      return;
    }
    setIsLoggedIn(true);
    axios
      .get(`${BASE_URL}/vendors/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        localStorage.setItem('user', JSON.stringify(res.data));
        setIsLoggedIn(true);
      })
      .catch((err) => {
        // Só termina a sessão se o servidor recusar explicitamente o token
        // (401/403). Erros de rede, timeouts ou indisponibilidade temporária
        // do backend (ex.: "cold start") não devem deslogar o vendedor.
        const status = err.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsLoggedIn(false);
        }
      });
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

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

  const profileLink = isLoggedIn ? '/dashboard' : '/vendor-login';

  return (
    <div className="wrapper">
      <nav className="navbar">
        <Link className="nav-logo" to="/">
          <img src="/logosite.png" alt="Sunny Sales" className="nav-logo-img" />
          Sunny Sales
        </Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`} ref={navLinksRef}>
          <NavLink
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            to="/sobre-projeto"
          >
            Sobre o Projeto
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            to="/sustentabilidade"
          >
            Praia Sustentável
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            to="/planos"
          >
            Planos
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            to="/como-funciona"
          >
            Para Vendedores
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
          <Link to={profileLink} className="profile-icon" aria-label="Perfil">
            <FiUser size={18} />
          </Link>
          <Link to="/map" className="nav-cta">
            <FiMapPin size={16} />
            Explorar Mapa
          </Link>
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

      <div className="container">
        {!HIDE_BACK_ROUTES.includes(location.pathname) && <BackHomeButton />}
        <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/sobre-projeto" element={<SobreProjeto />} />
          <Route path="/sustentabilidade" element={<Sustentabilidade />} />
          <Route path="/settings" element={<AccountSettings />} />
          <Route path="/login" element={<VendorLogin />} />
          <Route path="/vendor-login" element={<VendorLogin />} />
          <Route path="/vendor-register" element={<VendorRegister />} />
          <Route path="/register" element={<VendorRegister />} />
          <Route path="/account" element={<ManageAccount />} />
          <Route path="/paid-weeks" element={<PaidWeeksScreen />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/map" element={<ModernMapLayout />} />
          <Route path="/route-detail" element={<RouteDetail />} />
          <Route path="/routes" element={<RoutesScreen />} />
          <Route path="/products" element={<ProductsScreen />} />
          <Route path="/stats" element={<StatsScreen />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/terms" element={<TermsScreen />} />
          <Route path="/vendors/:id" element={<VendorDetailScreen />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/contacto" element={<Contacto />} />
          <Route path="/planos" element={<PlanosVendedores />} />
          <Route path="/faqs" element={<FAQ />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/legal-notice" element={<LegalNotice />} />
          <Route path="/cookies-policy" element={<CookiesPolicy />} />
          <Route path="/como-funciona" element={<HowItWorks />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
