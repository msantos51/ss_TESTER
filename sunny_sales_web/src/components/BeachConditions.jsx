import React, { useEffect, useState } from 'react';
import './BeachConditions.css';

// Widget "Condições de Praia" baseado na localização do utilizador
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

  useEffect(() => {
    requestLocation();
  }, []);

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
        setBeaches([
          { id: 'current', name: 'Localização atual', lat: userCoords.lat, lon: userCoords.lon },
        ]);
        setSelected({ id: 'current', name: 'Localização atual', lat: userCoords.lat, lon: userCoords.lon });
      }
    };
    fetchBeaches();
  }, [userCoords]);

  useEffect(() => {
    if (!selected) return;
    const fetchData = async () => {
      try {
        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${selected.lat}&longitude=${selected.lon}&current=temperature_2m,wind_speed_10m,relative_humidity_2m&daily=uv_index_max&forecast_days=1&timezone=auto`;

        const wRes = await fetch(weatherUrl);
        const wData = await wRes.json();
        setWeather({
          temperature: wData.current?.temperature_2m,
          wind: wData.current?.wind_speed_10m,
          humidity: wData.current?.relative_humidity_2m,
          uvMax: wData.daily?.uv_index_max?.[0],
          timezone: wData.timezone,
        });
      } catch (e) {
        setError('Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selected]);

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

      {beaches.length > 0 && (
        <div className="bc-selector">
          <select
            value={selected?.id || ''}
            onChange={(e) => {
              setLoading(true);
              setError(null);
              const b = beaches.find((b) => String(b.id) === e.target.value);
              setSelected(b);
            }}
          >
            {beaches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="bc-content">
        <div className="bc-weather">
          <div>Temperatura: {weather.temperature}&deg;C</div>
          <div>Vento: {weather.wind} km/h</div>
          <div>Humidade: {weather.humidity}%</div>
          <div>UV máx: {weather.uvMax}</div>
        </div>

      </div>
      <p className="bc-warning">
        Estimativa para uso recreativo; não usar para navegação.
      </p>
    </div>
  );
}
