// (em português) Componente principal da aplicação Web com rotas

import { HashRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { FiLogIn, FiUserPlus } from 'react-icons/fi';
import About from './pages/About';
import AccountSettings from './pages/AccountSettings';
import ClientLogin from './pages/ClientLogin';
import ClientRegister from './pages/ClientRegister';
import ForgotPassword from './pages/ForgotPassword';
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
import LoginSelection from './pages/LoginSelection';
import './index.css'; // (em português) Importa os estilos globais

// Componente principal que define as rotas da aplicação web
export default function App() {
  const isLoggedIn = localStorage.getItem('user') || localStorage.getItem('client');
  const profileLink = isLoggedIn ? '/dashboard' : '/login-selection';

  return (
    <Router>
      {/* (em português) Barra de navegação */}
      <header style={styles.navbar}>
        <Link style={styles.logo} to="/">Sunny Sales</Link>

        {/* (em português) Links de navegação removidos */}

        {/* (em português) Ícone de perfil */}
        <Link to={profileLink} style={styles.profileIcon} aria-label="Login">
          👤
        </Link>
      </header>

      {/* (em português) Container central da aplicação */}
      <div className="container">
        <Routes>
          {/* (em português) Página principal com layout moderno */}
          <Route path="/" element={<ModernMapLayout />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<AccountSettings />} />
          <Route path="/login" element={<ClientLogin />} />
          <Route path="/register" element={<ClientRegister />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/vendor-login" element={<VendorLogin />} />
          <Route path="/login-selection" element={<LoginSelection />} />
          <Route path="/account" element={<ManageAccount />} />
          <Route path="/edit-profile" element={<EditProfileScreen />} />
          <Route path="/paid-weeks" element={<PaidWeeksScreen />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/map" element={<ModernMapLayout />} />
          <Route path="/vendor-register" element={<VendorRegister />} />
          <Route path="/route-detail" element={<RouteDetail />} />
          <Route path="/routes" element={<RoutesScreen />} />
          <Route path="/stats" element={<StatsScreen />} />
          <Route path="/terms" element={<TermsScreen />} />
          <Route path="/vendors/:id" element={<VendorDetailScreen />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

// (em português) Estilos simples da barra de navegação
const styles = {
  navbar: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '1.5rem 2rem',
    backgroundColor: '#19a0a4',
    alignItems: 'center',
    position: 'relative',
    zIndex: 3000,
  },
  logo: {
    textDecoration: 'none',
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: '2.5rem',
  },
  profileIcon: {
    textDecoration: 'none',
    color: '#19a0a4',
    fontSize: '2rem',
    marginLeft: '1rem',
  },
};
