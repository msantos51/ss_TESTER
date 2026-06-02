import {
  HashRouter as Router,
  Routes,
  Route,
  Link,
  NavLink,
  useLocation,
} from 'react-router-dom';
import { FiUser, FiMenu, FiX, FiSun } from 'react-icons/fi';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { BASE_URL } from './config';
import About from './pages/About';
import AccountSettings from './pages/AccountSettings';
import VendorLogin from './pages/VendorLogin';
import ManageAccount from './pages/ManageAccount';
import EditProfileScreen from './pages/EditProfileScreen';
import PaidWeeksScreen from './pages/PaidWeeksScreen.jsx';
import VendorRegister from './pages/VendorRegister';
import RouteDetail from './pages/RouteDetail';
import RoutesScreen from './pages/RoutesScreen';
import StatsScreen from './pages/StatsScreen';
import TermsScreen from './pages/TermsScreen';
import VendorDetailScreen from './pages/VendorDetailScreen';
import Invoices from './pages/Invoices';
import Dashboard from './pages/Dashboard';
import ModernMapLayout from './pages/ModernMapLayout';
import SobreProjeto from './pages/SobreProjeto';
import Sustentabilidade from './pages/Sustentabilidade';
import ImplementarScreen from './pages/ImplementarScreen';
import Sessions from './pages/Sessions';
import ForgotPassword from './pages/ForgotPassword';
import Footer from './components/Footer';
import './index.css';

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

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.removeItem('user');
      setIsLoggedIn(false);
      return;
    }
    axios
      .get(`${BASE_URL}/vendors/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        localStorage.setItem('user', JSON.stringify(res.data));
        setIsLoggedIn(true);
      })
      .catch(() => {
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
            to="/implementacao"
          >
            Implementar
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
        <Routes>
          <Route path="/" element={<ModernMapLayout />} />
          <Route path="/about" element={<About />} />
          <Route path="/sobre-projeto" element={<SobreProjeto />} />
          <Route path="/sustentabilidade" element={<Sustentabilidade />} />
          <Route path="/implementacao" element={<ImplementarScreen />} />
          <Route path="/settings" element={<AccountSettings />} />
          <Route path="/login" element={<VendorLogin />} />
          <Route path="/vendor-login" element={<VendorLogin />} />
          <Route path="/vendor-register" element={<VendorRegister />} />
          <Route path="/register" element={<VendorRegister />} />
          <Route path="/account" element={<ManageAccount />} />
          <Route path="/edit-profile" element={<EditProfileScreen />} />
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
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}
