import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import BackHomeButton from '../components/BackHomeButton';
import { FiBarChart2, FiNavigation, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import './VendorPage.css';

const PERIODS = [
  { id: 7, label: '7 dias' },
  { id: 30, label: '30 dias' },
  { id: 0, label: 'Tudo' },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="ss-tooltip">
      <span className="ss-tooltip-date">{label}</span>
      <span className="ss-tooltip-value">{payload[0].value} km</span>
    </div>
  );
}

export default function StatsScreen() {
  const [allData, setAllData] = useState([]);
  const [period, setPeriod] = useState(30);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (!stored) { setLoading(false); return; }
    const vendor = JSON.parse(stored);
    axios.get(`${BASE_URL}/vendors/${vendor.id}/routes`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then(res => {
        const daily = {};
        res.data.forEach((r) => {
          const date = r.start_time.split('T')[0];
          daily[date] = (daily[date] || 0) + r.distance_m;
        });
        const sorted = Object.entries(daily).sort();
        const data = sorted.map(([date, dist]) => ({
          date: date.slice(5),
          fullDate: date,
          distance: Number((dist / 1000).toFixed(2)),
        }));
        setAllData(data);
      })
      .catch(e => console.error('Erro ao carregar estatísticas:', e))
      .finally(() => setLoading(false));
  }, []);

  const chartData = period === 0 ? allData : allData.slice(-period);

  const totalKm = chartData.reduce((s, d) => s + d.distance, 0).toFixed(1);
  const avgKm = chartData.length ? (chartData.reduce((s, d) => s + d.distance, 0) / chartData.length).toFixed(1) : '0';
  const maxKm = chartData.length ? Math.max(...chartData.map(d => d.distance)).toFixed(1) : '0';

  return (
    <div className="vendor-page">
      <BackHomeButton />

      <div className="vendor-hero">
        <FiBarChart2 className="vendor-hero-icon" />
        <h1 className="vendor-hero-title">Estatísticas</h1>
        <p className="vendor-hero-lead">
          Acompanhe suas distâncias percorridas e estatísticas de movimento.
        </p>
      </div>

      {allData.length > 0 && (
        <div className="vendor-cards" style={{ marginBottom: '2rem' }}>
          <div className="vendor-card">
            <div className="vendor-card-icon">
              <FiNavigation />
            </div>
            <div className="vendor-card-title">{totalKm} km</div>
            <div className="vendor-card-text">Total</div>
          </div>
          <div className="vendor-card">
            <div className="vendor-card-icon">
              <FiTrendingUp />
            </div>
            <div className="vendor-card-title">{avgKm} km</div>
            <div className="vendor-card-text">Média/dia</div>
          </div>
          <div className="vendor-card">
            <div className="vendor-card-icon">
              <FiCalendar />
            </div>
            <div className="vendor-card-title">{chartData.length}</div>
            <div className="vendor-card-text">Dias</div>
          </div>
        </div>
      )}

      {allData.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '2rem',
          padding: '12px',
          background: 'var(--surface-alt)',
          borderRadius: 'var(--radius-lg)',
          borderWidth: '1px',
          borderColor: 'var(--border)',
          borderStyle: 'solid'
        }}>
          {PERIODS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setPeriod(id)}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all var(--transition)',
                background: period === id ? 'var(--primary)' : 'transparent',
                color: period === id ? 'white' : 'var(--text-muted)',
                minHeight: 'auto'
              }}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid var(--border)',
            borderTop: '3px solid var(--primary)',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto'
          }} />
        </div>
      )}

      {!loading && allData.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          color: 'var(--text-muted)'
        }}>
          <FiBarChart2 size={48} style={{ opacity: 0.5, marginBottom: '12px' }} />
          <p style={{ fontSize: '1rem' }}>Nenhum trajeto disponível.</p>
        </div>
      )}

      {!loading && chartData.length > 0 && (
        <div className="vendor-section">
          <h2 className="vendor-section-title">Gráfico de Distâncias</h2>
          <div className="vendor-card" style={{ padding: '24px 20px' }}>
            <div style={{ height: '300px', marginBottom: '12px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 16, right: 8, left: -8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    unit=" km"
                    tick={{ fontSize: 11, fill: 'var(--text-muted)', fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--primary-light)' }} />
                  <Bar
                    dataKey="distance"
                    fill="var(--primary)"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {maxKm !== '0' && (
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                Máximo num dia: <strong style={{ color: 'var(--text)' }}>{maxKm} km</strong>
              </p>
            )}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
