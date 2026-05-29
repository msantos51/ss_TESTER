import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../config';
import BackHomeButton from '../components/BackHomeButton';

export default function RoutesScreen() {
  const [routes, setRoutes] = useState([]);
  const navigate = useNavigate();

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
      console.error('Erro ao carregar trajetos:', e);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  return (
    <div className="page-wrapper">
      <BackHomeButton />
      <h2>Histórico de Trajetos</h2>
      {routes.length === 0 && (
        <p className="page-empty">Sem trajetos registados.</p>
      )}
      <ul className="page-list">
        {routes.map((route) => {
          const start = new Date(route.start_time);
          const end = route.end_time ? new Date(route.end_time) : null;
          const durationMin = end ? Math.round((end - start) / 60000) : 0;

          return (
            <li
              key={route.id}
              className="page-list-item"
              onClick={() => navigate('/route-detail', { state: { route } })}
            >
              <div className="page-list-item-main">
                <span className="page-list-item-title">
                  {start.toLocaleString('pt-PT')}
                </span>
                <span className="page-list-item-desc">
                  {durationMin} min · {(route.distance_m / 1000).toFixed(2)} km
                </span>
              </div>
              <span className="page-chevron">›</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
