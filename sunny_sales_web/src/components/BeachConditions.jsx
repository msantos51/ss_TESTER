import React, { useEffect, useState } from 'react';
import './BeachConditions.css';

const uvLevel = (uv) => {
  if (!uv && uv !== 0) return { label: '–', color: 'var(--color-text-muted)' };
  if (uv <= 2) return { label: 'Baixo', color: '#22C55E' };
  if (uv <= 5) return { label: 'Moderado', color: '#F59E0B' };
  if (uv <= 7) return { label: 'Alto', color: '#F97316' };
  if (uv <= 10) return { label: 'Muito Alto', color: '#EF4444' };
  return { label: 'Extremo', color: '#9333EA' };
};

export default function BeachConditions() {
  const [userCoords, setUserCoords] = useState(null);
  const [beaches, setBeaches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const requestLocation = () => {
    setLoading(true);
    if (!navigator.geolocation) {
      setError('Geolocalização não suportada');
      setLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setError(null);
      },
      () => {
        setError('Não foi possível obter a localização.');
        setLoading(false);
      }
    );
  };

  useEffect(() => { requestLocation(); }, []);

  useEffect(() => {
    if (!userCoords) return;
    const fetchBeaches = async () => {
      try {
        const overpass = `https://overpass-api.de/api/interpreter?data=[out:json];(node(around:25000,${userCoords.lat},${userCoords.lon})[natural=beach];way(around:25000,${userCoords.lat},${userCoords.lon})[natural=beach];relation(around:25000,${userCoords.lat},${userCoords.lon})[natural=beach];);out center;`;
        const res = await fetch(overpass);
        const data = await res.json();
        const list = data.elements
          ?.filter((e) => e.tags?.name && (e.lat || e.center))
          .map((e) => ({
            id: e.id,
            name: e.tags.name,
            lat: e.lat || e.center.lat,
            lon: e.lon || e.center.lon,
          })) || [];
        const withCurrent = [
          { id: 'current', name: 'Localização atual', lat: userCoords.lat, lon: userCoords.lon },
          ...list,
        ];
        setBeaches(withCurrent);
        setSelected(withCurrent[0]);
      } catch {
        const fallback = [{ id: 'current', name: 'Localização atual', lat: userCoords.lat, lon: userCoords.lon }];
        setBeaches(fallback);
        setSelected(fallback[0]);
      }
    };
    fetchBeaches();
  }, [userCoords]);

  useEffect(() => {
    if (!selected) return;
    const fetchData = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${selected.lat}&longitude=${selected.lon}&current=temperature_2m,wind_speed_10m,relative_humidity_2m&daily=uv_index_max&forecast_days=1&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();
        setWeather({
          temperature: data.current?.temperature_2m,
          wind: data.current?.wind_speed_10m,
          humidity: data.current?.relative_humidity_2m,
          uvMax: data.daily?.uv_index_max?.[0],
        });
      } catch {
        setError('Erro ao carregar dados meteorológicos.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selected]);

  if (loading) {
    return (
      <div className="bc-container bc-loading">
        <div className="bc-spinner" />
        <span>A carregar condições…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bc-container bc-error">
        <span>⚠️ {error}</span>
        <button onClick={requestLocation} className="bc-retry">Tentar novamente</button>
      </div>
    );
  }

  const uv = uvLevel(weather?.uvMax);

  return (
    <div className="bc-container">
      <div className="bc-header">
        <span className="bc-title">🌊 Condições de Praia</span>
        {beaches.length > 0 && (
          <select
            className="bc-select"
            value={selected?.id || ''}
            onChange={(e) => {
              setLoading(true);
              setError(null);
              setSelected(beaches.find((b) => String(b.id) === e.target.value));
            }}
          >
            {beaches.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        )}
      </div>

      <div className="bc-grid">
        <div className="bc-stat">
          <span className="bc-stat-icon">🌡️</span>
          <span className="bc-stat-value">{weather?.temperature ?? '–'}°C</span>
          <span className="bc-stat-label">Temperatura</span>
        </div>
        <div className="bc-stat">
          <span className="bc-stat-icon">💨</span>
          <span className="bc-stat-value">{weather?.wind ?? '–'} km/h</span>
          <span className="bc-stat-label">Vento</span>
        </div>
        <div className="bc-stat">
          <span className="bc-stat-icon">💧</span>
          <span className="bc-stat-value">{weather?.humidity ?? '–'}%</span>
          <span className="bc-stat-label">Humidade</span>
        </div>
        <div className="bc-stat">
          <span className="bc-stat-icon">☀️</span>
          <span className="bc-stat-value" style={{ color: uv.color }}>{weather?.uvMax ?? '–'}</span>
          <span className="bc-stat-label">UV · {uv.label}</span>
        </div>
      </div>

      <p className="bc-warning">Estimativa indicativa — não usar para navegação.</p>
    </div>
  );
}
