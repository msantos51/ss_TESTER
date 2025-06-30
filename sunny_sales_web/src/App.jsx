// (em português) Componente principal da aplicação Web com rotas

import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import About from './pages/About';
import AccountSettings from './pages/AccountSettings';
import ClientLogin from './pages/ClientLogin';
import ClientRegister from './pages/ClientRegister';
import ForgotPassword from './pages/ForgotPassword';
import VendorLogin from './pages/VendorLogin';
import ManageAccount from './pages/ManageAccount';
import MapScreen from './pages/MapScreen';
import PaidWeeksScreen from './pages/PaidWeeksScreen.jsx';
import VendorRegister from './pages/VendorRegister';
import RouteDetail from './pages/RouteDetail';
import RoutesScreen from './pages/RoutesScreen';
import StatsScreen from './pages/StatsScreen';
import TermsScreen from './pages/TermsScreen';
import VendorDetailScreen from './pages/VendorDetailScreen';
import Invoices from './pages/Invoices';
import Dashboard from './pages/Dashboard';



export default function App() {
return (
<Router>
  <div style={styles.navbar}>
    <Link style={styles.link} to="/">🏖️ Sunny Sales</Link>
    <div>
      <Link style={styles.link} to="/about">Sobre</Link>
      <Link style={styles.link} to="/settings">Definições</Link>
    </div>
  </div>

  <Routes>
    <Route path="/" element={<h2 style={styles.home}>Bem-vindo à Sunny Sales!</h2>} />
    <Route path="/about" element={<About />} />
    <Route path="/settings" element={<AccountSettings />} />
    <Route path="/login" element={<ClientLogin />} />
    <Route path="/register" element={<ClientRegister />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/vendor-login" element={<VendorLogin />} />
    <Route path="/account" element={<ManageAccount />} />
    <Route path="/paid-weeks" element={<PaidWeeksScreen />} />
    <Route path="/invoices" element={<Invoices />} />
    <Route path="/map" element={<MapScreen />} />
    <Route path="/vendor-register" element={<VendorRegister />} />
    <Route path="/route-detail" element={<RouteDetail />} />
    <Route path="/routes" element={<RoutesScreen />} />
    <Route path="/stats" element={<StatsScreen />} />
    <Route path="/terms" element={<TermsScreen />} />
    <Route path="/vendors/:id" element={<VendorDetailScreen />} />
    <Route path="/dashboard" element={<Dashboard />} />


  </Routes>
</Router>
);
}

// (em português) Estilos simples para layout da aplicação
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
home: {
padding: '2rem',
textAlign: 'center',
},
};

