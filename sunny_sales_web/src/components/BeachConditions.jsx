import React, { useEffect, useState } from 'react';
import './BeachConditions.css';

// Estações maregráficas do IPMA com coordenadas aproximadas
const TIDE_STATIONS = [
  { id: 1110600, name: "Viana do Castelo", lat: 41.69, lon: -8.84 },
  { id: 1131200, name: "Leixões",           lat: 41.18, lon: -8.70 },
  { id: 1141900, name: "Aveiro",            lat: 40.64, lon: -8.75 },
  { id: 1160700, name: "Figueira da Foz",   lat: 40.15, lon: -8.86 },
  { id: 1182300, name: "Nazaré",            lat: 39.60, lon: -9.08 },
  { id: 1110800, name: "Cascais",           lat: 38.70, lon: -9.42 },
  { id: 1114300, name: "Lisboa",            lat: 38.71, lon: -9.14 },
  { id: 1115600, name: "Setúbal",           lat: 38.52, lon: -8.90 },
  { id: 1112200, name: "Sines",             lat: 37.96, lon: -8.88 },
  { id: 1121000, name: "Lagos",             lat: 37.10, lon: -8.67 },
  { id: 1124200, name: "Faro",              lat: 37.02, lon: -7.93 },
  { id: 1131700, name: "Vila Real de Sto. António", lat: 37.19, lon: -7.41 },
];

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function nearestStation(lat, lon) {
  return TIDE_STATIONS.reduce((best, s) => {
    const d = haversineKm(lat, lon, s.lat, s.lon);
    return d < best.dist ? { station: s, dist: d } : best;
  }, { station: TIDE_STATIONS[0], dist: Infinity }).station;
}

// Widget "Condições de Praia" baseado na localização do utilizador
export default function BeachConditions() {

  const [userCoords, setUserCoords] = useState(null);
  const [beaches, setBeaches] = useState([]);
  const [selected, setSelected] = useState(null);

  const [weather, setWeather] = useState(null);
  const [tides, setTides] = useState(null);
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
        });

        // Marés via IPMA — estação mais próxima da praia selecionada
        const station = nearestStation(selected.lat, selected.lon);
        const tideUrl = `https://api.ipma.pt/open-data/forecast/oceanography/daily/hp-daily-tide-forecast-day0.json`;
        const tRes = await fetch(tideUrl);
        const tData = await tRes.json();
        // A resposta tem um array "data"; cada elemento tem globalIdLocal e tides[]
        const stationData = tData?.data?.find(
          (d) => d.globalIdLocal === station.id
        );
        if (stationData?.tides) {
          const now = new Date();
          const nowMinutes = now.getHours() * 60 + now.getMinutes();
          const toMinutes = (hora) => {
            const [h, m] = hora.split(':').map(Number);
            return h * 60 + m;
          };
          // Próximas marés: filtra as que ainda não passaram, ordena por hora
          const upcoming = stationData.tides
            .filter((t) => toMinutes(t.hora) >= nowMinutes)
            .sort((a, b) => toMinutes(a.hora) - toMinutes(b.hora));
          const nextHigh = upcoming.find((t) => t.level === 'PM');
          const nextLow  = upcoming.find((t) => t.level === 'BM');
          setTides({
            stationName: station.name,
            nextHigh: nextHigh ? { hora: nextHigh.hora, altura: nextHigh.altura } : null,
            nextLow:  nextLow  ? { hora: nextLow.hora,  altura: nextLow.altura  } : null,
          });
        } else {
          setTides(null);
        }
      } catch (e) {
        setError('Erro ao carregar dados.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selected]);

  if (loading) return (
    <div className="bc-container bc-loading">
      <div className="bc-spinner" />
      A carregar...
    </div>
  );

  if (error)
    return (
      <div className="bc-container">
        <p>{error}</p>
        <button onClick={requestLocation}>Tentar novamente</button>
      </div>
    );

  if (!weather) return null;

  return (
    <div className="bc-container">

      {beaches.length > 0 && (
        <div className="bc-selector">
          <select
            value={selected?.id || ''}
            onChange={(e) => {
              setLoading(true);
              setError(null);
              const b = beaches.find((item) => String(item.id) === e.target.value);
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

        {tides && (
          <div className="bc-tides">
            <div className="bc-tides-title">
              Marés — {tides.stationName}
            </div>
            <div className="bc-tides-grid">
              <div className="bc-tide-item bc-tide-high">
                <span className="bc-tide-label">🌊 Maré cheia</span>
                {tides.nextHigh
                  ? <><span className="bc-tide-time">{tides.nextHigh.hora}</span><span className="bc-tide-height">{tides.nextHigh.altura} m</span></>
                  : <span className="bc-tide-time">—</span>
                }
              </div>
              <div className="bc-tide-item bc-tide-low">
                <span className="bc-tide-label">🏖️ Maré vazia</span>
                {tides.nextLow
                  ? <><span className="bc-tide-time">{tides.nextLow.hora}</span><span className="bc-tide-height">{tides.nextLow.altura} m</span></>
                  : <span className="bc-tide-time">—</span>
                }
              </div>
            </div>
          </div>
        )}
      </div>
      <p className="bc-warning">
        Estimativa para uso recreativo; não usar para navegação. Marés: IPMA.
      </p>
    </div>
  );
}
