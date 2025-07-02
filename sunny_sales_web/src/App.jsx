// (em português) Componente principal da aplicação Web com rotas

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import About from './pages/About';
import AccountSettings from './pages/AccountSettings';
import ClientLogin from './pages/ClientLogin';
import ClientRegister from './pages/ClientRegister';
import ForgotPassword from './pages/ForgotPassword';
import VendorLogin from './pages/VendorLogin';
import ManageAccount from './pages/ManageAccount';
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
import './index.css'; // (em português) Importa os estilos globais

export default function App() {
  return (
    <Router>
      {/* (em português) Barra de navegação */}
      <div style={styles.navbar}>
        <Link style={styles.link} to="/">Sunny Sales</Link>
      </div>

      {/* (em português) Container central da aplicação */}
      <div className="container">
        <Routes>
          {/* Usamos o novo layout moderno como página principal */}
          <Route path="/" element={<ModernMapLayout />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<AccountSettings />} />
          <Route path="/login" element={<ClientLogin />} />
          <Route path="/register" element={<ClientRegister />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/vendor-login" element={<VendorLogin />} />
          <Route path="/account" element={<ManageAccount />} />
          <Route path="/paid-weeks" element={<PaidWeeksScreen />} />
          <Route path="/invoices" element={<Invoices />} />

          {/* Mantemos a rota /map apontando também para o layout moderno */}
          <Route path="/map" element={<ModernMapLayout />} />

          <Route path="/map" element={<MapScreen />} />
          <Route path="/modern-map" element={<ModernMapLayout />} />

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
    padding: '1rem 2rem',
    backgroundColor: '#f9c200',
    alignItems: 'center',
  },
  link: {
    marginLeft: '1rem',
    textDecoration: 'none',
    color: 'black',
    fontWeight: 'bold',
  },
};
