import React from 'react';
import { useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import BackHomeButton from '../components/BackHomeButton';

export default function RouteDetail() {
  const location = useLocation();
  const route = location.state?.route;

  if (!route) {
    return <div className="page-wrapper"><p className="page-empty">Trajeto não encontrado.</p></div>;
  }

  const polyline = route.points.map((p) => [p.lat, p.lng]);
  const initial = polyline.length ? polyline[0] : [0, 0];
  const start = new Date(route.start_time);
  const end = route.end_time ? new Date(route.end_time) : null;
  const durationMin = end ? Math.round((end - start) / 60000) : 0;

  return (
    <div className="page-wrapper">
      <BackHomeButton />

      <div className="route-map">
        <MapContainer center={initial} zoom={15} style={{ width: '100%', height: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://openstreetmap.org'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
            subdomains="abcd"
            maxZoom={19}
          />
          <Polyline positions={polyline} color="var(--primary)" weight={4} />
        </MapContainer>
      </div>

      <div className="route-info-card">
        <div className="route-info-row">
          <span className="route-info-label">Início</span>
          <span className="route-info-value">{start.toLocaleString('pt-PT')}</span>
        </div>
        {end && (
          <div className="route-info-row">
            <span className="route-info-label">Fim</span>
            <span className="route-info-value">{end.toLocaleString('pt-PT')}</span>
          </div>
        )}
        <div className="route-info-row">
          <span className="route-info-label">Duração</span>
          <span className="route-info-value">{durationMin} min</span>
        </div>
        <div className="route-info-row">
          <span className="route-info-label">Distância</span>
          <span className="route-info-value">{(route.distance_m / 1000).toFixed(2)} km</span>
        </div>
      </div>
    </div>
  );
}
