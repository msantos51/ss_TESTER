// (em português) Painel principal do vendedor com partilha de localização e menu lateral
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import axios from 'axios';

// (em português) Função auxiliar que devolve o cabeçalho de autenticação
const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// (em português) Estilos do ecrã do vendedor
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
  logoutButton: {
    marginTop: '0.75rem',
    borderRadius: 12,
    backgroundColor: '#333',
    border: 'none',
    padding: '0.6rem 1.2rem',
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
  // (em português) Estilo do contentor do toggle de localização
  toggleWrapper: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '1rem',
  },
};

// (em português) watchId global simples para gerir o watchPosition
let watchId = null;

// (em português) Componente principal do dashboard do vendedor
export default function VendorDashboard() {
  const [vendor, setVendor] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(true); // (em português) estado da partilha de localização
  const menuButtonRef = useRef(null);
  const sideMenuRef = useRef(null);
  const navigate = useNavigate();

  // (em português) Pára a partilha de localização (watchPosition + endpoint /routes/stop)
  const stopSharing = useCallback(async () => {
    try {
      if (watchId !== null && navigator?.geolocation?.clearWatch) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
      }
      if (vendor) {
        await axios.post(`${BASE_URL}/vendors/${vendor.id}/routes/stop`, null, {
          headers: authHeaders(),
        });
      }
    } catch (err) {
      console.error('Erro ao parar localização:', err);
    }
  }, [vendor]);

  // (em português) Termina sessão
  const logout = () => {
    stopSharing();
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/vendor-login');
  };

  // (em português) Inicia a partilha de localização (watchPosition + endpoint /routes/start)
  const startSharing = useCallback(async () => {
    if (!vendor) return;

    // (em português) Verificação de subscrição
    const expires = vendor.subscription_valid_until
      ? new Date(vendor.subscription_valid_until)
      : null;
    if (!vendor.subscription_active || (expires && expires < new Date())) {
      alert('Não consegue partilhar a localização porque não tem a subscrição ativa');
      return;
    }

    try {
      await axios.post(`${BASE_URL}/vendors/${vendor.id}/routes/start`, null, {
        headers: authHeaders(),
      });

      if (!navigator?.geolocation?.watchPosition) {
        console.error('Geolocation não disponível no navegador.');
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          try {
            await axios.put(
              `${BASE_URL}/vendors/${vendor.id}/location`,
              { lat: pos.coords.latitude, lng: pos.coords.longitude },
              { headers: authHeaders() }
            );
          } catch (err) {
            console.error('Erro ao enviar localização:', err);
          }
        },
        (err) => console.error('Erro localização:', err),
        { enableHighAccuracy: true, maximumAge: 0 }
      );
    } catch (err) {
      if (err?.response?.status === 403) {
        alert('Não consegue partilhar a localização porque não tem a subscrição ativa');
      } else {
        console.error('Erro ao ativar localização:', err);
      }
    }
  }, [vendor]);

  // (em português) Atualiza a partilha quando o toggle muda
  useEffect(() => {
    if (!vendor) return;
    if (sharingLocation) {
      startSharing();
      return () => {
        stopSharing();
      };
    }
    stopSharing();
  }, [vendor, sharingLocation, startSharing, stopSharing]);

  // (em português) Alterna o valor do toggle
  const handleToggleLocation = () => {
    setSharingLocation((prev) => !prev);
  };

  // (em português) Carrega o vendedor do localStorage
  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        setVendor(JSON.parse(stored));
      } catch {
        console.warn('Erro a ler "user" do localStorage');
      }
    }
  }, []);
  // (em português) Pagamento da subscrição semanal
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

  // (em português) Fecha o menu clicando fora
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
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Abrir menu"
      >
        ☰
      </button>

      <div
        ref={sideMenuRef}
        style={{ ...styles.sideMenu, ...(menuOpen ? styles.sideMenuOpen : {}) }}
      >
        <div style={styles.menuList}>
          <button
            style={styles.menuButtonItem}
            onClick={() => {
              paySubscription();
              setMenuOpen(false);
            }}
          >
            Pagar Semanalidade
          </button>
          <button
            style={styles.menuButtonItem}
            onClick={() => {
              navigate('/paid-weeks');
              setMenuOpen(false);
            }}
          >
            Semanas Pagas
          </button>
          <button
            style={styles.menuButtonItem}
            onClick={() => {
              navigate('/invoices');
              setMenuOpen(false);
            }}
          >
            Faturas
          </button>

          <div style={styles.divider} />

          <button
            style={styles.menuButtonItem}
            onClick={() => {
              navigate('/routes');
              setMenuOpen(false);
            }}
          >
            Trajetos
          </button>
          <button
            style={styles.menuButtonItem}
            onClick={() => {
              navigate('/stats');
              setMenuOpen(false);
            }}
          >
            Distância Percorrida
          </button>
          <button
            style={styles.menuButtonItem}
            onClick={() => {
              navigate('/sessions');
              setMenuOpen(false);
            }}
          >
            Sessões
          </button>

          <div style={styles.divider} />

          <button
            style={styles.menuButtonItem}
            onClick={() => {
              navigate('/account');
              setMenuOpen(false);
            }}
          >
            Atualizar Dados Pessoais
          </button>

          <div style={styles.divider} />

          <button
            style={styles.menuButtonItem}
            onClick={() => {
              navigate('/terms');
              setMenuOpen(false);
            }}
          >
            Termos e Condições
          </button>
          <button
            style={styles.menuButtonItem}
            onClick={() => {
              window.location.href = 'mailto:suporte@sunnysales.com';
              setMenuOpen(false);
            }}
          >
            Contactar Suporte
          </button>
        </div>
      </div>

      <div style={styles.container}>
        <h2 style={styles.title}>Painel do Vendedor</h2>

        {vendor && (
          <div style={styles.infoBox}>
            {vendor.profile_photo && (
              <img
                src={`${BASE_URL.replace(/\/$/, '')}/${vendor.profile_photo}`}
                alt="Foto de perfil"
                style={styles.photo}
              />
            )}
            <p>
              <strong>Nome:</strong> {vendor.name}
            </p>
            <p>
              <strong>Email:</strong> {vendor.email}
            </p>
            <p>
              <strong>Produto:</strong> {vendor.product ?? '—'}
            </p>
            <p>
              <strong>Cor do Pin:</strong>
              <span
                style={{
                  ...styles.pinPreview,
                  backgroundColor: vendor.pin_color || '#FFB6C1',
                }}
              />
            </p>
            <p>
              <strong>Subscrição:</strong>{' '}
              {vendor.subscription_active ? (
                <>
                  ativa
                  {vendor.subscription_valid_until && (
                    <>
                      {' '}
                      (Termina a:{' '}
                      {new Date(
                        vendor.subscription_valid_until
                      ).toLocaleDateString('pt-PT')}
                      )
                    </>
                  )}
                </>
              ) : (
                'inativa'
              )}
            </p>
          </div>
        )}

        <div style={styles.toggleWrapper}>
          <label>
            <input
              type="checkbox"
              checked={sharingLocation}
              onChange={handleToggleLocation}
            />
            Partilhar Localização
          </label>
        </div>

        <button className="btn" style={styles.logoutButton} onClick={logout}>
          Sair
        </button>
      </div>
    </div>
  );
}
