import React from 'react';
import { useLocation } from 'react-router-dom';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { FiMapPin, FiClock, FiNavigation, FiCalendar } from 'react-icons/fi';
import './RouteDetail.css';

export default function RouteDetail() {
  const location = useLocation();
  const route = location.state?.route;

  if (!route) {
    return (
      <div className="rd-wrapper">
        <div className="rd-empty">
          <FiMapPin className="rd-empty-icon" />
          <p>Trajeto não encontrado.</p>
        </div>
      </div>
    );
  }

  const polyline = route.points.map((p) => [p.lat, p.lng]);
  const initial = polyline.length ? polyline[0] : [0, 0];
  const start = new Date(route.start_time);
  const end = route.end_time ? new Date(route.end_time) : null;
  const durationMin = end ? Math.round((end - start) / 60000) : 0;
  const km = (route.distance_m / 1000).toFixed(2);

  const dateStr = start.toLocaleDateString('pt-PT', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="rd-wrapper">
      <div className="rd-container">

        <div className="rd-header">
          <div className="rd-header-icon"><FiMapPin /></div>
          <div>
            <h1 className="rd-title">Detalhe do Trajeto</h1>
            <p className="rd-subtitle">{dateStr}</p>
          </div>
        </div>

        <div className="rd-map">
          <MapContainer center={initial} zoom={15} style={{ width: '100%', height: '100%' }}>
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
              attribution="&copy; <a href='https://openstreetmap.org'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
              subdomains="abcd"
              maxZoom={19}
            />
            <Polyline positions={polyline} color={route.pin_color || "var(--blue)"} weight={4} />
          </MapContainer>
        </div>

        <div className="rd-stats-grid">
          <div className="rd-stat-card">
            <div className="rd-stat-icon"><FiCalendar /></div>
            <span className="rd-stat-label">Início</span>
            <span className="rd-stat-value">
              {start.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {end && (
            <div className="rd-stat-card">
              <div className="rd-stat-icon"><FiCalendar /></div>
              <span className="rd-stat-label">Fim</span>
              <span className="rd-stat-value">
                {end.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}

          <div className="rd-stat-card">
            <div className="rd-stat-icon"><FiClock /></div>
            <span className="rd-stat-label">Duração</span>
            <span className="rd-stat-value">{durationMin} <span className="rd-stat-unit">min</span></span>
          </div>

          <div className="rd-stat-card rd-stat-card--accent">
            <div className="rd-stat-icon"><FiNavigation /></div>
            <span className="rd-stat-label">Distância</span>
            <span className="rd-stat-value">{km} <span className="rd-stat-unit">km</span></span>
          </div>
        </div>

      </div>
    </div>
  );
}
