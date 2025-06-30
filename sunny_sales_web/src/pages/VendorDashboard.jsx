import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import axios from 'axios';

let watchId = null;

export default function VendorDashboard() {
  const [vendor, setVendor] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // carrega dados do vendedor guardados no localStorage
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setVendor(JSON.parse(stored));
    }
    const share = localStorage.getItem('sharingLocation') === 'true';
    setSharing(share);
  }, []);

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/vendor-login');
  };

  const startSharing = async () => {
    if (!vendor) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await axios.post(`${BASE_URL}/vendors/${vendor.id}/routes/start`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          try {
            await axios.put(
              `${BASE_URL}/vendors/${vendor.id}/location`,
              { lat: pos.coords.latitude, lng: pos.coords.longitude },
              { headers: { Authorization: `Bearer ${token}` } }
            );
          } catch (err) {
            console.log('Erro ao enviar localização:', err);
          }
        },
        (err) => console.log('Erro localização:', err),
        { enableHighAccuracy: true }
      );
      localStorage.setItem('sharingLocation', 'true');
      setSharing(true);
    } catch (err) {
      console.log('Erro ao ativar localização:', err);
    }
  };

  const stopSharing = async () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    if (vendor) {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          await axios.post(`${BASE_URL}/vendors/${vendor.id}/routes/stop`, null, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (err) {
          console.log('Erro ao parar localização:', err);
        }
      }
    }
    localStorage.setItem('sharingLocation', 'false');
    setSharing(false);
  };

  return (
    <div style={styles.container}>
      <button style={styles.menuButton} onClick={() => setMenuOpen(!menuOpen)}>☰</button>
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
          <p><strong>Email:</strong> {vendor.email}</p>
          <p><strong>Produto:</strong> {vendor.product}</p>
          <p>
            <strong>Cor do Pin:</strong>
            <span style={{ ...styles.pinPreview, backgroundColor: vendor.pin_color || '#FFB6C1' }} />
          </p>
          <p>
            <strong>Subscrição:</strong>{' '}
            {vendor.subscription_active ? 'ativa' : 'inativa'}
          </p>
        </>
      )}

      <button style={styles.shareButton} onClick={sharing ? stopSharing : startSharing}>
        {sharing ? 'Desativar Localização' : 'Ativar Localização'}
      </button>

      <button style={styles.logout} onClick={logout}>Sair</button>

      {menuOpen && (
        <div style={styles.menu} onClick={() => setMenuOpen(false)}>
          <Link style={styles.link} to="/routes">Trajetos</Link>
          <Link style={styles.link} to="/paid-weeks">Semanas Pagas</Link>
          <Link style={styles.link} to="/stats">Estatísticas</Link>
          <Link style={styles.link} to="/account">Conta</Link>
        </div>
      )}
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
  shareButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#f9c200',
    cursor: 'pointer',
  },
  menuButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '50%',
    padding: '0.5rem',
    cursor: 'pointer',
  },
  menu: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  pinPreview: {
    display: 'inline-block',
    width: 16,
    height: 16,
    borderRadius: '50%',
    marginLeft: 8,
    verticalAlign: 'middle',
  },
};
