import {
  HashRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
  useLocation,
} from 'react-router-dom';
import { FiUser, FiMenu, FiX, FiSun } from 'react-icons/fi';
import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import axios from 'axios';
import { BASE_URL } from './config';
import ModernMapLayout from './pages/ModernMapLayout';
import Footer from './components/Footer';
import './index.css';

// Code-splitting: estas páginas só são transferidas quando o utilizador
// navega para elas, reduzindo o bundle inicial carregado em "/".
const About = lazy(() => import('./pages/About'));
const AccountSettings = lazy(() => import('./pages/AccountSettings'));
const VendorLogin = lazy(() => import('./pages/VendorLogin'));
const ManageAccount = lazy(() => import('./pages/ManageAccount'));
const PaidWeeksScreen = lazy(() => import('./pages/PaidWeeksScreen.jsx'));
const VendorRegister = lazy(() => import('./pages/VendorRegister'));
const RouteDetail = lazy(() => import('./pages/RouteDetail'));
const RoutesScreen = lazy(() => import('./pages/RoutesScreen'));
const StatsScreen = lazy(() => import('./pages/StatsScreen'));
const TermsScreen = lazy(() => import('./pages/TermsScreen'));
const VendorDetailScreen = lazy(() => import('./pages/VendorDetailScreen'));
const Invoices = lazy(() => import('./pages/Invoices'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SobreProjeto = lazy(() => import('./pages/SobreProjeto'));
const Sustentabilidade = lazy(() => import('./pages/Sustentabilidade'));
const Sessions = lazy(() => import('./pages/Sessions'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Contacto = lazy(() => import('./pages/Contacto'));
const PlanosVendedores = lazy(() => import('./pages/PlanosVendedores'));

export default function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

function AppLayout() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('user'));
  const navLinksRef = useRef(null);
  const lastCheckedToken = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      lastCheckedToken.current = null;
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      return;
    }
    // Evita revalidar o token em cada mudança de rota: só verifica
    // quando o token muda (login/logout) em vez de em todas as navegações.
    if (token === lastCheckedToken.current) return;
    axios
      .get(`${BASE_URL}/vendors/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        lastCheckedToken.current = token;
        localStorage.setItem('user', JSON.stringify(res.data));
        setIsLoggedIn(true);
      })
      .catch(() => {
        lastCheckedToken.current = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
      });
  }, [location]);

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
          <span className="nav-logo-icon"><FiSun size={22} /></span>
          Sunny Sales
        </Link>

        <div className={`nav-links ${menuOpen ? 'open' : ''}`} ref={navLinksRef}>
          <NavLink
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            to="/sobre-projeto"
          >
            Sobre o Projeto
          </NavLink>
          <span className="nav-divider">|</span>
          <NavLink
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            to="/sustentabilidade"
          >
            Sustentabilidade
          </NavLink>
          <span className="nav-divider">|</span>
          <NavLink
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            to="/planos"
          >
            Planos
          </NavLink>
          <span className="nav-divider">|</span>
          <NavLink
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            to="/contacto"
          >
            Contacto
          </NavLink>
        </div>

        <div className="nav-icons">
          <Link to={profileLink} className="profile-icon" aria-label="Perfil">
            <FiUser size={18} />
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
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<ModernMapLayout />} />
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
            <Route path="/stats" element={<StatsScreen />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/terms" element={<TermsScreen />} />
            <Route path="/vendors/:id" element={<VendorDetailScreen />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/contacto" element={<Contacto />} />
            <Route path="/planos" element={<PlanosVendedores />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </Suspense>
      </div>
      <Footer />
    </div>
  );
}
