// (em português) Componente principal da aplicação Web com rotas

import {
  HashRouter as Router,
  Routes,
  Route,
  Link,
  useLocation,
} from 'react-router-dom';
import { FiUser, FiMenu } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from './config';
import About from './pages/About';
import AccountSettings from './pages/AccountSettings';
import VendorLogin from './pages/VendorLogin';
import ForgotPassword from './pages/ForgotPassword';
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
import Footer from './components/Footer';
import './index.css'; // (em português) Importa os estilos globais

// Componente principal que define as rotas da aplicação web
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

  const profileLink = isLoggedIn ? '/dashboard' : '/vendor-login';

  return (
    <div className="wrapper">
      {/* (em português) Barra de navegação */}
      <header className="header-wrapper">
        <Link className="logo-link" to="/">Sunny Sales</Link>
        <div className="navbar">
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <FiMenu />
          </button>

          {/* (em português) Links de navegação para as páginas informativas */}
          <nav className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <Link
              className="nav-link"
              to="/sobre-projeto"
              onClick={() => setMenuOpen(false)}
            >
              Sobre o Projeto
            </Link>
            <Link
              className="nav-link"
              to="/sustentabilidade"
              onClick={() => setMenuOpen(false)}
            >
              Sustentabilidade
            </Link>
            <Link
              className="nav-link"
              to="/implementacao"
              onClick={() => setMenuOpen(false)}
            >
              Implementar
            </Link>
          </nav>

          <Link to={profileLink} className="profile-icon" aria-label="Login">
            <FiUser />
          </Link>
        </div>
      </header>

      {/* (em português) Container central da aplicação */}
      <div className="container">
        <Routes>
          {/* (em português) Página principal com layout moderno */}
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
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/account" element={<ManageAccount />} />
          <Route path="/edit-profile" element={<EditProfileScreen />} />
          <Route path="/paid-weeks" element={<PaidWeeksScreen />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/map" element={<ModernMapLayout />} />
          <Route path="/route-detail" element={<RouteDetail />} />
          <Route path="/routes" element={<RoutesScreen />} />
          <Route path="/stats" element={<StatsScreen />} />
          <Route path="/terms" element={<TermsScreen />} />
          <Route path="/vendors/:id" element={<VendorDetailScreen />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
      <Footer />
    </div>
  );
}

