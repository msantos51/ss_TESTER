// (em português) Dashboard do cliente na versão web com favoritos e menu lateral

import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HamburgerMenu from '../components/HamburgerMenu';
import axios from 'axios';
import { BASE_URL } from '../config';

export default function DashboardCliente() {
  const [client, setClient] = useState(null);
  const [favorites, setFavorites] = useState([]);
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
    <div style={styles.container}>
      <HamburgerMenu style={styles.menuButton}>
        <legend>Menu</legend>
        <ul>
          <li><button onClick={() => navigate('/settings')}>Notificações</button></li>
          <hr />
          <li><button onClick={() => navigate('/account')}>Atualizar Dados Pessoais</button></li>
          <li><button onClick={() => navigate('/account')}>Apagar Conta</button></li>
          <hr />
          <li><button onClick={() => navigate('/terms')}>Termos e Condições</button></li>
          <li>
            <button onClick={() => (window.location.href = 'mailto:suporte@sunnysales.com')}>Contactar Suporte</button>
          </li>
        </ul>
      </HamburgerMenu>

      <h2 style={styles.title}>Meu Perfil</h2>

      {client?.profile_photo && (
        <img src={`${BASE_URL}/${client.profile_photo}`} style={styles.image} alt="Foto de perfil" />
      )}

      {client && (
        <>
          <p><strong>Nome:</strong> {client.name}</p>
          <p><strong>Email:</strong> {client.email}</p>
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

      <button onClick={logout} className="btn" style={styles.logoutButton}>Sair</button>
    </div>
  );
}

// estilos embutidos
const styles = {
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
  logoutButton: {
    width: '100%',
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#FDC500',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  menuButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    fontSize: '2rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
  }
}