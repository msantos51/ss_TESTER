// (em português) Dashboard do cliente na versão web com favoritos e menu lateral

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../config';

// Painel principal do cliente com lista de favoritos
export default function DashboardCliente() {
  const [client, setClient] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  // carregar cliente do localStorage
  const loadClient = () => {
    const stored = localStorage.getItem('client');
    if (stored) {
      setClient(JSON.parse(stored));
    }
  };

  // carregar favoritos
  const loadFavorites = async () => {
    try {
      const ids = JSON.parse(localStorage.getItem('favorites') || '[]');
      if (ids.length === 0) return setFavorites([]);
      const resp = await axios.get(`${BASE_URL}/vendors/`);
      const vendors = resp.data.filter(v => ids.includes(v.id));
      setFavorites(vendors);
    } catch (err) {
      console.log('Erro ao carregar favoritos:', err);
    }
  };

  // Termina a sessão do cliente
  const logout = () => {
    localStorage.removeItem('client');
    localStorage.removeItem('clientToken');
    navigate('/login');
  };

  useEffect(() => {
    loadClient();
    loadFavorites();
  }, []);

  return (
    <div style={styles.wrapper}>
      <button style={styles.menuButton} onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>
      <div
        style={{
          ...styles.sideMenu,
          ...(menuOpen ? styles.sideMenuOpen : {}),
        }}
      >
        <legend>Menu</legend>
        <ul style={styles.menuList}>
          <li>
            <button style={styles.menuButtonItem} onClick={() => navigate('/settings')}>
              Notificações
            </button>
          </li>
          <hr />
          <li>
            <button style={styles.menuButtonItem} onClick={() => navigate('/edit-profile')}>
              Atualizar Dados Pessoais
            </button>
          </li>
          <li>
            <button style={styles.menuButtonItem} onClick={() => alert('Funcionalidade indisponível')}>
              Apagar Conta
            </button>
          </li>
          <hr />
          <li>
            <button style={styles.menuButtonItem} onClick={() => navigate('/terms')}>
              Termos e Condições
            </button>
          </li>
          <li>
            <button
              style={styles.menuButtonItem}
              onClick={() => (window.location.href = 'mailto:suporte@sunnysales.com')}
            >
              Contactar Suporte
            </button>
          </li>
        </ul>
      </div>

      <div style={styles.container}>
        <h2 style={styles.title}>Meu Perfil</h2>

        {client?.profile_photo && (
          <img src={`${BASE_URL}/${client.profile_photo}`} style={styles.image} alt="Foto de perfil" />
        )}

        {client && (
          <>
            <p>
              <strong>Nome:</strong> {client.name}
            </p>
            <p>
              <strong>Email:</strong> {client.email}
            </p>
          </>
        )}

        <h3 style={styles.subtitle}>Vendedores Favoritos</h3>
        <div style={styles.favList}>
          {favorites.map((item) => (
            <div key={item.id} style={styles.vendor}>
              <img
                src={`${BASE_URL}/${item.profile_photo}`}
                alt={item.name}
                style={{
                  ...styles.vendorPhoto,
                  borderColor: item.subscription_active ? 'green' : 'red',
                }}
              />
              <span>{item.name}</span>
            </div>
          ))}
        </div>

        <button onClick={logout} className="btn" style={styles.fullButton}>
          Sair
        </button>
      </div>
    </div>
  );
}

// (em português) Estilos CSS embutidos
const styles = {
  wrapper: {
    position: 'relative',
  },
  container: {
    padding: '2rem',
    maxWidth: '600px',
    margin: 'auto',
    position: 'relative',
  },
  title: {
    textAlign: 'center',
  },
  subtitle: {
    marginTop: '2rem',
    marginBottom: '1rem',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    display: 'block',
    margin: '1rem auto',
  },
  favList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  vendor: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    borderBottom: '1px solid #ccc',
    paddingBottom: '0.5rem',
  },
  vendorPhoto: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    borderWidth: 2,
    borderStyle: 'solid',
  },
  fullButton: {
    width: 'auto',
    alignSelf: 'center',
    margin: '12px auto',
    borderRadius: 12,
    backgroundColor: '#19a0a4',
    border: 'none',
    padding: '1rem',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  menuButton: {
    position: 'fixed',
    top: '8rem',
    left: '1rem',
    zIndex: 1100,
    backgroundColor: '#19a0a4',
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
    zIndex: 1000,
  },
  sideMenuOpen: {
    transform: 'translateX(0)',
  },
  menuList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    alignItems: 'flex-start',
  },
  menuButtonItem: {
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: '#19a0a4',
    color: 'white',
    border: 'none',
    borderRadius: '20px',
    fontWeight: 'bold',
    cursor: 'pointer',
    textAlign: 'left',
  },
};
