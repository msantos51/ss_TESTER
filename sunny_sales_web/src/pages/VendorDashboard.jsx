// (em português) Painel principal do vendedor com partilha de localização e menu lateral

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import axios from 'axios';

// Token JWT fixo fornecido pelo cliente para autenticar as requisições de localização
const LOCATION_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NTY5NzYxNTksImp0aSI6IjRhZGVkZWQ5ZTgzMDQ4YzU4MTI5NDk2OGZhNjQwZWExIiwic3ViIjoxfQ.Elsk92DJnIzFyYLbROkBK1lIVN00v7wlOC6_oVuM3w0';

let watchId = null;

export default function VendorDashboard() {

  const [vendor, setVendor] = useState(null); // (em português) Dados do vendedor guardados em estado

  const [menuOpen, setMenuOpen] = useState(false); // (em português) Controla a abertura do menu lateral
  const menuButtonRef = useRef(null); // (em português) Referência ao botão de menu
  const sideMenuRef = useRef(null); // (em português) Referência ao menu lateral
  const navigate = useNavigate(); // (em português) Navegador para redirecionar o utilizador

  const stopSharing = useCallback(async () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      watchId = null;
    }
    if (vendor) {
      // (em português) Envia pedido para parar a partilha de localização
      try {
        await axios.post(`${BASE_URL}/vendors/${vendor.id}/routes/stop`, null, {
          headers: { Authorization: `Bearer ${LOCATION_TOKEN}` },
        });
      } catch (err) {
        console.error('Erro ao parar localização:', err);
      }
    }

  }, [vendor]);

  const logout = () => {
    stopSharing(); // (em português) Garante que a partilha termina ao fazer logout
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/vendor-login');
  };

  const startSharing = useCallback(async () => {
    if (!vendor) return;
    // (em português) Verifica se a subscrição está ativa antes de iniciar
    const expires = vendor.subscription_valid_until
      ? new Date(vendor.subscription_valid_until)
      : null;
    if (!vendor.subscription_active || (expires && expires < new Date())) {
      alert('Não consegue partilhar a localização porque não tem a subscrição ativa');
      return;
    }

    if (!LOCATION_TOKEN) return; // (em português) Garante que o token existe

    try {
      await axios.post(`${BASE_URL}/vendors/${vendor.id}/routes/start`, null, {
        headers: { Authorization: `Bearer ${LOCATION_TOKEN}` },
      });
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          try {
            await axios.put(
              `${BASE_URL}/vendors/${vendor.id}/location`,
              { lat: pos.coords.latitude, lng: pos.coords.longitude },
              { headers: { Authorization: `Bearer ${LOCATION_TOKEN}` } }
            );
          } catch (err) {
            console.error('Erro ao enviar localização:', err);
          }
        },
        (err) => console.error('Erro localização:', err),
        { enableHighAccuracy: true, maximumAge: 0 }
      );

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
  }, []);

  useEffect(() => {

    if (!vendor) return;
    startSharing(); // (em português) Inicia a partilha assim que o vendedor é carregado
    return () => {
      stopSharing(); // (em português) Para partilha quando o componente é desmontado
    };
  }, [vendor, startSharing, stopSharing]);


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

        <button className="btn" style={styles.logoutButton} onClick={logout}>Sair</button>

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
    textAlign: 'left',
  },
  shareButton: {
    width: 'auto',
    alignSelf: 'center',
    margin: '12px auto',
    borderRadius: 12,
    backgroundColor: '#FCB454',
    border: 'none',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    color: '#fff',
  },

  menuButton: {
    position: 'fixed',
    top: '8rem',
    left: '1rem',
    zIndex: 1100,
    backgroundColor: '#FCB454',
    color: '#fff',
    border: 'none',
    padding: '0.5rem 1rem',
    cursor: 'pointer',
    fontSize: '1.2rem',
    borderRadius: '50%',
  },
  sideMenu: {
    position: 'fixed',
    top: '100px',
    left: 0,
    height: 'calc(100% - 100px)',
    width: '250px',
    backgroundColor: '#f8f8f8',
    boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
    padding: '1rem',
    boxSizing: 'border-box',
    transform: 'translateX(-100%)',
    transition: 'transform 0.3s ease-in-out',
    zIndex: 900,
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
    backgroundColor: '#FCB454',
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
