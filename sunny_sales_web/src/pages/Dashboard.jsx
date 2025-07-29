import React from 'react';
import VendorDashboard from './VendorDashboard';

// Escolhe o dashboard apropriado consoante o tipo de utilizador
export default function Dashboard() {
  const hasVendor = !!localStorage.getItem('user');

  if (hasVendor) return <VendorDashboard />;
  return <p style={{ padding: '2rem', textAlign: 'center' }}>Utilizador não autenticado.</p>;
}
