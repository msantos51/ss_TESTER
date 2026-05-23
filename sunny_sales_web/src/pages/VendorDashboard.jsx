// (em português) Painel principal do vendedor com partilha de localização e menu lateral

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import axios from 'axios';
import './VendorDashboard.css';

let watchId = null;

export default function VendorDashboard() {
  const [vendor, setVendor] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef(null);
  const sideMenuRef = useRef(null);
  const navigate = useNavigate();

  const logout = () => {
    stopSharing();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/vendor-login');
  };

  const startSharing = useCallback(async () => {
    if (!vendor) return;
    // Impede ativar a localização quando a subscrição não está ativa
    const expires = vendor.subscription_valid_until
      ? new Date(vendor.subscription_valid_until)
      : null;
    if (!vendor.subscription_active || (expires && expires < new Date())) {
      alert('Não consegue partilhar a localização porque não tem a subscrição ativa');
      return;
    }
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
            console.error('Erro ao enviar localização:', err);
          }
        },
        (err) => console.error('Erro localização:', err),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
      localStorage.setItem('sharingLocation', 'true');
      setSharing(true);
    } catch (err) {
      if (err.response && err.response.status === 403) {
        alert('Não consegue partilhar a localização porque não tem a subscrição ativa');
      } else {
        console.error('Erro ao ativar localização:', err);
      }
    }
  }, [vendor]);

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

  const stopSharing = async () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    if (vendor) {
      const token = localStorage.getItem('token');
      try {
        await axios.post(`${BASE_URL}/vendors/${vendor.id}/routes/stop`, null, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (err) {
        console.error('Erro ao parar localização:', err);
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
      console.error('Erro no pagamento:', err);
    }
  };

  useEffect(() => {
    if (!menuOpen) return;
    const handleClickOutside = (e) => {
      if (
        sideMenuRef.current &&
        !sideMenuRef.current.contains(e.target) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(e.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  return (
    <div style={styles.wrapper}>
      <button
        ref={menuButtonRef}
        style={styles.menuButton}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        ☰
      </button>

      <div
        ref={sideMenuRef}
        style={{ ...styles.sideMenu, ...(menuOpen ? styles.sideMenuOpen : {}) }}
      >
        <div style={styles.menuList}>
          <button style={styles.menuButtonItem} onClick={() => { paySubscription(); setMenuOpen(false); }}>Pagar Semanalidade</button>
          <button style={styles.menuButtonItem} onClick={() => { navigate('/paid-weeks'); setMenuOpen(false); }}>Semanas Pagas</button>
          <button style={styles.menuButtonItem} onClick={() => { navigate('/invoices'); setMenuOpen(false); }}>Faturas</button>

          <div style={styles.divider} />

          <button style={styles.menuButtonItem} onClick={() => { navigate('/routes'); setMenuOpen(false); }}>Trajetos</button>
          <button style={styles.menuButtonItem} onClick={() => { navigate('/stats'); setMenuOpen(false); }}>Distância Percorrida</button>
          <button style={styles.menuButtonItem} onClick={() => { navigate('/sessions'); setMenuOpen(false); }}>Sessões</button>

          <div style={styles.divider} />

          <button style={styles.menuButtonItem} onClick={() => { navigate('/account'); setMenuOpen(false); }}>Atualizar Dados Pessoais</button>

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
              {vendor.subscription_active ? (
                <>
                  ativa
                  {vendor.subscription_valid_until && (
                    <> (Termina a: {new Date(vendor.subscription_valid_until).toLocaleDateString('pt-PT')})</>
                  )}
                </>
              ) : (
                'inativa'
              )}
            </p>
          </div>
        )}

        {/* (em português) Bloco que contém o switch para ativar/desativar a partilha de localização */}
        <div style={styles.toggleContainer}>
          <label className="vendor-switch">
            <input
              type="checkbox"
              checked={sharing}
              onChange={sharing ? stopSharing : startSharing}
            />
            <span className="slider" />
          </label>
          <span style={styles.switchLabel}>
            {sharing ? 'Localização Ligada' : 'Localização Desligada'}
          </span>
        </div>

        <button className="btn" style={styles.logoutButton} onClick={logout}>Sair</button>
      </div>
    </div>
  );
}

const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 600;

const styles = {
  wrapper: {
    position: 'relative',
  },
  container: {
    padding: '1.5rem 1rem',
    maxWidth: '600px',
    margin: '0 auto',
    textAlign: 'center',
    position: 'relative',
  },
  title: {
    marginBottom: '1rem',
    fontSize: 'clamp(1.2rem, 5vw, 1.75rem)',
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
    textAlign: 'left',
    wordBreak: 'break-word',
  },
  logoutButton: {
    width: 'auto',
    alignSelf: 'center',
    margin: '12px auto',
    borderRadius: 12,
    backgroundColor: '#FCB454',
    border: 'none',
    padding: '0.75rem 1.5rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#fff',
    minHeight: '44px',
  },
  toggleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    justifyContent: 'center',
    margin: '16px auto',
  },
  // (em português) Texto que mostra o estado atual da localização
  switchLabel: {
    fontWeight: 'bold',
    fontSize: '1rem',
  },
  menuButton: {
    position: 'fixed',
    top: '8rem',
    left: '0.75rem',
    zIndex: 1100,
    backgroundColor: '#FCB454',
    color: '#fff',
    border: 'none',
    padding: '0.6rem 1rem',
    cursor: 'pointer',
    fontSize: '1.2rem',
    borderRadius: '50%',
    width: '48px',
    height: '48px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
  },
  sideMenu: {
    position: 'fixed',
    top: '100px',
    left: 0,
    height: 'calc(100% - 100px)',
    width: 'min(280px, 85vw)',
    backgroundColor: '#f8f8f8',
    boxShadow: '2px 0 8px rgba(0,0,0,0.15)',
    padding: '1rem',
    paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
    boxSizing: 'border-box',
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s ease-in-out',
    zIndex: 900,
    overflowY: 'auto',
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
    padding: '0.85rem 1rem',
    backgroundColor: '#FCB454',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'left',
    minHeight: '44px',
    fontSize: '0.95rem',
  },
  divider: {
    height: '1px',
    backgroundColor: '#ccc',
    width: '100%',
    margin: '0.5rem 0',
  },
};
