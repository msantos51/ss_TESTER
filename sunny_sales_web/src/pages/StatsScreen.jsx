import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import BackHomeButton from '../components/BackHomeButton';

export default function StatsScreen() {
  const [chartData, setChartData] = useState([]);

  const loadRoutes = async () => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!stored) return;
    const vendor = JSON.parse(stored);
    try {
      const res = await axios.get(`${BASE_URL}/vendors/${vendor.id}/routes`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const daily = {};
      res.data.forEach((r) => {
        const date = r.start_time.split('T')[0];
        daily[date] = (daily[date] || 0) + r.distance_m;
      });

      const sorted = Object.entries(daily).sort();
      const data = sorted.map(([date, dist]) => ({
        date: date.slice(5),
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
    <div className="page-wrapper">
      <BackHomeButton />
      <h2>Distâncias percorridas por dia</h2>

      {chartData.length > 0 ? (
        <div className="chart-wrapper">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 16, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <YAxis unit=" km" tick={{ fontSize: 12, fill: 'var(--text-secondary)' }} />
              <Tooltip
                contentStyle={{
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.85rem',
                }}
              />
              <Bar dataKey="distance" fill="var(--primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <p className="page-empty">Nenhum trajeto disponível.</p>
      )}
    </div>
  );
}
