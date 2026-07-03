import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BASE_URL } from '../config';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { FiBarChart2, FiNavigation, FiCalendar, FiTrendingUp } from 'react-icons/fi';
import './StatsScreen.css';

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
    <div className="ss-wrapper">
      <div className="ss-container">

        <div className="ss-header">
          <div className="ss-header-icon"><FiBarChart2 /></div>
          <div>
            <h1 className="ss-title">Estatísticas</h1>
            <p className="ss-subtitle">Distâncias percorridas por dia</p>
          </div>
        </div>

        {allData.length > 0 && (
          <div className="ss-summary">
            <div className="ss-stat">
              <div className="ss-stat-icon"><FiNavigation /></div>
              <span className="ss-stat-value">{totalKm}<span className="ss-stat-unit"> km</span></span>
              <span className="ss-stat-label">Total</span>
            </div>
            <div className="ss-stat-divider" />
            <div className="ss-stat">
              <div className="ss-stat-icon"><FiTrendingUp /></div>
              <span className="ss-stat-value">{avgKm}<span className="ss-stat-unit"> km</span></span>
              <span className="ss-stat-label">Média/dia</span>
            </div>
            <div className="ss-stat-divider" />
            <div className="ss-stat">
              <div className="ss-stat-icon"><FiCalendar /></div>
              <span className="ss-stat-value">{chartData.length}</span>
              <span className="ss-stat-label">Dias</span>
            </div>
          </div>
        )}

        {allData.length > 0 && (
          <div className="ss-period-bar">
            {PERIODS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                className={`ss-period-btn${period === id ? ' active' : ''}`}
                onClick={() => setPeriod(id)}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {loading && (
          <div className="ss-loading">
            <div className="ss-spinner" />
          </div>
        )}

        {!loading && allData.length === 0 && (
          <div className="ss-empty">
            <FiBarChart2 className="ss-empty-icon" />
            <p>Nenhum trajeto disponível.</p>
          </div>
        )}

        {!loading && chartData.length > 0 && (
          <div className="ss-card">
            <div className="ss-chart">
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
              <p className="ss-chart-note">Máximo num dia: <strong>{maxKm} km</strong></p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
