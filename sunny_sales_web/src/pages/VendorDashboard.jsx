import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';

export default function VendorDashboard() {
  const [vendor, setVendor] = useState(null);
  const navigate = useNavigate();

  // carrega dados do vendedor guardados no localStorage
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setVendor(JSON.parse(stored));
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/vendor-login');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Painel do Vendedor</h2>
      {vendor && (
        <>
          {vendor.profile_photo && (
            <img
              src={`${BASE_URL.replace(/\/$/, '')}/${vendor.profile_photo}`}
              alt="Foto"
              style={styles.photo}
            />
          )}
          <p><strong>Nome:</strong> {vendor.name}</p>
          <p><strong>Produto:</strong> {vendor.product}</p>
          {vendor.subscription_active && (
            <p style={styles.subActive}>Subscrição ativa</p>
          )}
        </>
      )}

      <div style={styles.links}>
        <Link style={styles.link} to="/routes">Trajetos</Link>
        <Link style={styles.link} to="/paid-weeks">Semanas Pagas</Link>
        <Link style={styles.link} to="/stats">Estatísticas</Link>
        <Link style={styles.link} to="/account">Conta</Link>
      </div>
      <button style={styles.logout} onClick={logout}>Sair</button>
    </div>
  );
}

const styles = {
  container: {
    padding: '2rem',
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
  },
  title: {
    marginBottom: '1rem',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    objectFit: 'cover',
    marginBottom: '1rem',
  },
  links: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    margin: '1rem 0',
  },
  link: {
    textDecoration: 'none',
    color: '#0077cc',
  },
  subActive: {
    color: 'green',
    fontWeight: 'bold',
  },
  logout: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#f9c200',
    cursor: 'pointer',
  },
};
