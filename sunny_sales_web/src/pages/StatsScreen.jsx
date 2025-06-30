// (em português) Página Web de estatísticas com gráfico de distâncias percorridas por dia
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useNavigate } from 'react-router-dom';

export default function StatsScreen() {
  const [chartData, setChartData] = useState([]);
  const navigate = useNavigate();

  // carregar dados
  const loadRoutes = async () => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!stored) return;
    const vendor = JSON.parse(stored);
    try {
      const res = await axios.get(`${BASE_URL}/vendors/${vendor.id}/routes`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      // agrupar por dia
      const daily = {};
      res.data.forEach((r) => {
        const date = r.start_time.split('T')[0];
        daily[date] = (daily[date] || 0) + r.distance_m;
      });

      // preparar dados para o gráfico
      const sorted = Object.entries(daily).sort();
      const data = sorted.map(([date, dist]) => ({
        date: date.slice(5), // MM-DD
        distance: Number((dist / 1000).toFixed(2)),
      }));

      setChartData(data);
    } catch (e) {
      console.error('Erro ao carregar estatísticas:', e);
    }
  };

  useEffect(() => {
    loadRoutes();
  }, []);

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.back}>⬅ Voltar</button>
      <h2 style={styles.title}>Distâncias percorridas por dia</h2>

      {chartData.length > 0 ? (
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis unit=" km" />
              <Tooltip />
              <Bar dataKey="distance" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p>Nenhum trajeto disponível</p>
      )}
    </div>
  );
}

// estilos
const styles = {
  container: { padding: '2rem', maxWidth: 800, margin: '0 auto' },
  title: { fontSize: '1.5rem', marginBottom: '1rem' },
  back: {
    marginBottom: '1rem',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    color: '#0077cc',
  },
};
