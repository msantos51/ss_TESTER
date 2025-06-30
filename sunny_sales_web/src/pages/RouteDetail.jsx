// (em português) Página Web com os detalhes de um trajeto com mapa e informações
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function RouteDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const route = location.state?.route;

  if (!route) {
    return <p>Trajeto não encontrado.</p>;
  }

  // pontos do trajeto
  const polyline = route.points.map(p => [p.lat, p.lng]);

  // posição inicial
  const initial = polyline.length ? polyline[0] : [0, 0];

  // datas
  const start = new Date(route.start_time);
  const end = route.end_time ? new Date(route.end_time) : null;
  const durationMin = end ? Math.round((end - start) / 60000) : 0;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.back}>⬅ Voltar</button>

      <MapContainer center={initial} zoom={15} style={styles.map}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap"
        />
        <Polyline positions={polyline} color="blue" />
      </MapContainer>

      <div style={styles.info}>
        <p><strong>Início:</strong> {start.toLocaleString()}</p>
        {end && <p><strong>Fim:</strong> {end.toLocaleString()}</p>}
        <p><strong>Duração:</strong> {durationMin} min</p>
        <p><strong>Distância:</strong> {(route.distance_m / 1000).toFixed(2)} km</p>
      </div>
    </div>
  );
}

// estilos simples
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
  map: { height: '400px', width: '100%', marginBottom: '1rem' },
  info: { padding: '1rem', backgroundColor: '#f0f0f0', borderRadius: '8px' },
};
