// (em português) Painel principal do vendedor com partilha de localização e menu lateral

import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import axios from 'axios';

let watchId = null;

export default function VendorDashboard() {
  const [vendor, setVendor] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      setVendor(JSON.parse(stored));
    }
    const share = localStorage.getItem('sharingLocation') === 'true';
    setSharing(share);
  }, []);

  useEffect(() => {
    if (sharing && vendor && watchId === null) {
      startSharing();
    }
  }, [sharing, vendor, startSharing]);


  const logout = () => {
    stopSharing();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/vendor-login');
  };

  const startSharing = useCallback(async () => {
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
        { enableHighAccuracy: true, maximumAge: 0 }
      );
      localStorage.setItem('sharingLocation', 'true');
      setSharing(true);
    } catch (err) {
      console.log('Erro ao ativar localização:', err);
    }
  }, [vendor]);

  const stopSharing = async () => {
    if (watchId !== null) {
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

  const paySubscription = async () => {
    if (!vendor) return;
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        `${BASE_URL}/vendors/${vendor.id}/create-checkout-session`,
        null,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      if (res.data.checkout_url) window.open(res.data.checkout_url, '_blank');
    } catch (err) {
      console.log('Erro no pagamento:', err);
    }
  };

  return (
    <div style={styles.wrapper}>
      <button style={styles.menuButton} onClick={() => setMenuOpen(!menuOpen)}>☰</button>

      <div style={{ ...styles.sideMenu, ...(menuOpen ? styles.sideMenuOpen : {}) }}>
        <div style={styles.menuList}>
          <button style={styles.menuButtonItem} onClick={() => { paySubscription(); setMenuOpen(false); }}>Pagar Semanalidade</button>
          <button style={styles.menuButtonItem} onClick={() => { navigate('/paid-weeks'); setMenuOpen(false); }}>Semanas Pagas</button>
          <button style={styles.menuButtonItem} onClick={() => { navigate('/invoices'); setMenuOpen(false); }}>Faturas</button>

          <div style={styles.divider} />

          <button style={styles.menuButtonItem} onClick={() => { navigate('/routes'); setMenuOpen(false); }}>Trajetos</button>
          <button style={styles.menuButtonItem} onClick={() => { navigate('/stats'); setMenuOpen(false); }}>Distância Percorrida</button>

          <div style={styles.divider} />

          <button style={styles.menuButtonItem} onClick={() => { navigate('/account'); setMenuOpen(false); }}>Atualizar Dados Pessoais</button>
          <button style={styles.menuButtonItem} onClick={() => { navigate('/account'); setMenuOpen(false); }}>Apagar Conta</button>

          <div style={styles.divider} />

          <button style={styles.menuButtonItem} onClick={() => { navigate('/terms'); setMenuOpen(false); }}>Termos e Condições</button>
          <button style={styles.menuButtonItem} onClick={() => { window.location.href = 'mailto:suporte@sunnysales.com'; setMenuOpen(false); }}>Contactar Suporte</button>
        </div>
      </div>

      <div style={styles.container}>
        <h2 style={styles.title}>Painel do Vendedor</h2>

        {vendor && (
          <div style={styles.infoBox}>
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

          </div>
        )}

        <div style={styles.toggleContainer}>
          <input
            id="location-toggle"
            type="checkbox"
            className="theme-checkbox"
            checked={sharing}
            onChange={sharing ? stopSharing : startSharing}
          />
          <label htmlFor="location-toggle">
            {sharing ? 'Desativar Localização' : 'Ativar Localização'}
          </label>
        </div>

        <button className="btn" style={styles.logoutButton} onClick={logout}>Sair</button>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    position: 'relative',
  },
  container: {
    padding: '2rem',
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
    position: 'relative',
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
  pinPreview: {
    display: 'inline-block',
    width: 16,
    height: 16,
    borderRadius: '50%',
    marginLeft: 8,
    verticalAlign: 'middle',
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: '1rem',
    borderRadius: '12px',
    marginBottom: '1rem',
  },
  logoutButton: {
    width: 'auto',
    alignSelf: 'center',
    margin: '12px auto',
    borderRadius: 12,
    backgroundColor: '#000',
    border: 'none',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#fff',
  },
  toggleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    justifyContent: 'center',
    margin: '12px auto',
  },
  menuButton: {
    position: 'fixed',
    top: '8rem',
    left: '1rem',
    zIndex: 1100,
    backgroundColor: '#000',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    fontSize: '1.2rem',
    borderRadius: '50%',
  },
  sideMenu: {
    position: 'fixed',
    top: 0,
    left: 0,
    height: '100%',
    width: '250px',
    backgroundColor: '#f8f8f8',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    padding: '1rem',
    paddingTop: '9rem',
    boxSizing: 'border-box',
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s ease-in-out',
    zIndex: 1200,
  },
  sideMenuOpen: {
    transform: 'translateX(0)',
  },
  menuList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    alignItems: 'stretch',
  },
  menuButtonItem: {
    padding: '0.75rem 1rem',
    backgroundColor: '#000',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'left',
  },
  divider: {
    height: '1px',
    backgroundColor: '#ccc',
    width: '100%',
    margin: '0.5rem 0',
  },
};

