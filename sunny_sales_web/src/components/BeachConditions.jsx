import React, { useEffect, useState } from 'react';
import './BeachConditions.css';

// Widget "Condições de Praia" baseado na localização do utilizador
export default function BeachConditions() {
  const [coords, setCoords] = useState(null);
  const [weather, setWeather] = useState(null);
  const [tides, setTides] = useState([]);
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
        setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setError(null);
      },
      () => {
        setError('Não foi possível obter a localização.');
        setLoading(false);
      }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  useEffect(() => {
    if (!coords) return;
    const fetchData = async () => {
      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,wind_speed_10m,relative_humidity_2m&daily=uv_index_max&forecast_days=1&timezone=auto`;

        const marineUrl = `https://marine-api.open-meteo.com/v1/marine?latitude=${coords.lat}&longitude=${coords.lon}&hourly=sea_level&length=1&timezone=auto`;

        const [wRes, mRes] = await Promise.all([
          fetch(weatherUrl),
          fetch(marineUrl),
        ]);
        const wData = await wRes.json();
        const mData = await mRes.json();
        setWeather({
          temperature: wData.current?.temperature_2m,
          wind: wData.current?.wind_speed_10m,
          humidity: wData.current?.relative_humidity_2m,
          uvMax: wData.daily?.uv_index_max?.[0],
          timezone: wData.timezone,
        });
        const tideEvents = calcTides(
          mData.hourly?.time || [],

          mData.hourly?.sea_level || []

        );
        setTides(tideEvents);
      } catch (e) {
        setError('Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [coords]);

  const fmt = (t) =>
    new Date(t).toLocaleTimeString('pt-PT', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: weather?.timezone || 'UTC',
    });

  if (loading) return <div className="bc-container">A carregar...</div>;

  if (error)
    return (
      <div className="bc-container">
        <p>{error}</p>
        <button onClick={requestLocation}>Tentar novamente</button>
      </div>
    );

  return (
    <div className="bc-container">

      <div className="bc-content">
        <div className="bc-weather">
          <div>Temperatura: {weather.temperature}&deg;C</div>
          <div>Vento: {weather.wind} km/h</div>
          <div>Humidade: {weather.humidity}%</div>
          <div>UV máx: {weather.uvMax}</div>
        </div>
        <div className="bc-tides">
          <p>Marés de hoje:</p>
          <ul>

            {tides.length ? (
              tides.map((t) => (
                <li key={t.time}>
                  {t.type === 'high' ? 'Alta' : 'Baixa'} {fmt(t.time)}
                </li>
              ))
            ) : (
              <li>Sem dados</li>
            )}
          </ul>
        </div>

      </div>
      <p className="bc-warning">
        Estimativa para uso recreativo; não usar para navegação.
      </p>
    </div>
  );
}

function calcTides(times, levels) {
  const events = [];
  for (let i = 1; i < levels.length - 1; i++) {
    const prev = levels[i - 1];
    const curr = levels[i];
    const next = levels[i + 1];
    if (curr > prev && curr > next) events.push({ type: 'high', time: times[i] });
    if (curr < prev && curr < next) events.push({ type: 'low', time: times[i] });
  }
  events.sort((a, b) => new Date(a.time) - new Date(b.time));
  const unique = [];
  for (const ev of events) {
    const last = unique[unique.length - 1];
    if (!last || new Date(ev.time) - new Date(last.time) >= 60 * 60 * 1000) {
      unique.push(ev);
    }
  }
  return unique;
}
