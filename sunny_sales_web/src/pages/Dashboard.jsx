import React from 'react';
import DashboardCliente from './DashboardCliente';
import VendorDashboard from './VendorDashboard';

// Escolhe o dashboard apropriado consoante o tipo de utilizador
export default function Dashboard() {
  const hasClient = !!localStorage.getItem('client');
  const hasVendor = !!localStorage.getItem('user');

  if (hasClient) return <DashboardCliente />;
  if (hasVendor) return <VendorDashboard />;
  return <p style={{ padding: '2rem', textAlign: 'center' }}>Utilizador não autenticado.</p>;
}
