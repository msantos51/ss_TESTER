// (em português) Página Web que lista os trajetos do vendedor autenticado
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../config';

export default function RoutesScreen() {
  const [routes, setRoutes] = useState([]);
  const navigate = useNavigate();

  // carregar trajetos do vendedor
  const loadRoutes = async () => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!stored) return;
    const vendor = JSON.parse(stored);

    try {
      const res = await axios.get(`${BASE_URL}/vendors/${vendor.id}/routes`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      setRoutes(res.data);
    } catch (e) {
      console.log('Erro ao carregar trajetos:', e);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.back}>⬅ Voltar</button>
      <h2>Histórico de Trajetos</h2>
      <ul style={styles.list}>
        {routes.map((route) => {
          const start = new Date(route.start_time);
          const end = route.end_time ? new Date(route.end_time) : null;
          const durationMin = end ? Math.round((end - start) / 60000) : 0;
          const description = `${durationMin} min - ${(route.distance_m / 1000).toFixed(2)} km`;

          return (
            <li
              key={route.id}
              style={styles.item}
              onClick={() => navigate('/route-detail', { state: { route } })}
            >
              <strong>{start.toLocaleString()}</strong>
              <div>{description}</div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// estilos
const styles = {
  container: { padding: '1rem', maxWidth: '800px', margin: '0 auto' },
  back: {
    marginBottom: '1rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    color: '#0077cc',
  },
  list: { listStyle: 'none', padding: 0 },
  item: {
    padding: '12px',
    borderBottom: '1px solid #ccc',
    cursor: 'pointer',
  },
};
