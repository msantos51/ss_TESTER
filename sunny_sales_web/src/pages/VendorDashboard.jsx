import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BASE_URL } from '../config';
import axios from 'axios';
import DashboardMenu from '../components/DashboardMenu';

let watchId = null;

export default function VendorDashboard() {
  const [vendor, setVendor] = useState(null);
  const [sharing, setSharing] = useState(false);
  const [reviews, setReviews] = useState([]);
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

  useEffect(() => {
    const loadReviews = async () => {
      if (!vendor) return;
      try {
        const res = await axios.get(`${BASE_URL}/vendors/${vendor.id}/reviews`);
        setReviews(res.data);
      } catch (err) {
        console.log('Erro ao carregar reviews:', err);
      }
    };
    loadReviews();
  }, [vendor]);

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
      <DashboardMenu>
        <legend>Menu</legend>
        <ul>
          <li><button onClick={paySubscription}>Pagar Semanalidade</button></li>
          <li><button onClick={() => navigate('/paid-weeks')}>Semanas Pagas</button></li>
          <li><button onClick={() => navigate('/invoices')}>Faturas</button></li>
          <hr />
          <li><button onClick={() => navigate('/routes')}>Trajetos</button></li>
          <li><button onClick={() => navigate('/stats')}>Distância Percorrida</button></li>
          <hr />
          <li><button onClick={() => navigate('/account')}>Atualizar Dados Pessoais</button></li>
          <li><button onClick={() => navigate('/account')}>Apagar Conta</button></li>
          <hr />
          <li><button onClick={() => navigate('/terms')}>Termos e Condições</button></li>
          <li><button onClick={() => (window.location.href = 'mailto:suporte@sunnysales.com')}>Contactar Suporte</button></li>
        </ul>
      </DashboardMenu>
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
          {reviews.length > 0 && (
            <div style={styles.reviewSection}>
              <h3>Avaliações</h3>
              <ul style={styles.reviewList}>
                {reviews.map((r) => (
                  <li key={r.id} style={styles.reviewItem}>
                    <strong>⭐ {r.rating}</strong>
                    {r.comment && <span> {r.comment}</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}

      <button className="btn" style={styles.shareButton} onClick={sharing ? stopSharing : startSharing}>
        {sharing ? 'Desativar Localização' : 'Ativar Localização'}
      </button>

      <button className="btn" style={styles.logout} onClick={logout}>Sair</button>
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
  link: {
    textDecoration: 'none',
    color: '#19a0a4',
  },
  subActive: {
    color: 'green',
    fontWeight: 'bold',
  },
  logout: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    border: 'none',
    backgroundColor: '#19a0a4',
    cursor: 'pointer',
  },
  shareButton: {
    marginTop: '1rem',
    padding: '0.5rem 1rem',
    border: 'none',
    backgroundColor: '#19a0a4',
    cursor: 'pointer',
  },
  pinPreview: {
    display: 'inline-block',
    width: 16,
    height: 16,
    borderRadius: '50%',
    marginLeft: 8,
    verticalAlign: 'middle',
  },
  reviewSection: {
    marginTop: '1rem',
    textAlign: 'left',
  },
  reviewList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  reviewItem: {
    borderBottom: '1px solid #ccc',
    padding: '4px 0',
  },
};

