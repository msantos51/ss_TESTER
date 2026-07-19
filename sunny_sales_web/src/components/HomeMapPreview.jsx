import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import { BASE_URL } from '../config';
import { useNavigate } from 'react-router-dom';
import { FiArrowUpRight } from 'react-icons/fi';
import './HomeMapPreview.css';

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function getVendorPinHtml(color) {
  const safeColor = escapeHtml(color);
  return `<div class="vendor-pin-marker" style="--pin-color: ${safeColor};"></div>`;
}

function MapContent({ vendors, onMapClick }) {
  const map = useMap();

  useEffect(() => {
    if (vendors.length > 0) {
      const group = new L.FeatureGroup(
        vendors.map(v => {
          const icon = L.divIcon({
            html: getVendorPinHtml(v.pin_color || '#7B61FF'),
            className: 'vendor-marker-icon',
            iconSize: [30, 37],
            iconAnchor: [15, 36],
          });
          return L.marker([v.current_lat, v.current_lng], { icon });
        })
      );
      if (group.getLayers().length > 0) {
        map.fitBounds(group.getBounds(), { padding: [40, 40], maxZoom: 15 });
      }
    }
  }, [vendors, map]);

  return (
    <>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
        attribution="&copy; <a href='https://openstreetmap.org'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
        subdomains="abcd"
        maxZoom={19}
      />
      {vendors.map(v => {
        const icon = L.divIcon({
          html: getVendorPinHtml(v.pin_color || '#7B61FF'),
          className: 'vendor-marker-icon',
          iconSize: [30, 37],
          iconAnchor: [15, 36],
        });
        return (
          <Marker
            key={v.id}
            position={[v.current_lat, v.current_lng]}
            icon={icon}
          />
        );
      })}
    </>
  );
}

export default function HomeMapPreview() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${BASE_URL}/vendors`)
      .then(res => {
        const filtered = res.data.filter(v => v.current_lat && v.current_lng);
        setVendors(filtered);
      })
      .catch(() => {
        setVendors([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const defaultCenter = [40.2, -8.4];
  const defaultZoom = 7;

  const handleMapClick = () => {
    navigate('/map');
  };

  return (
    <div className="home-map-preview">
      <div className="home-map-container" onClick={handleMapClick}>
        {loading ? (
          <div className="home-map-loading">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            <MapContainer
              center={defaultCenter}
              zoom={defaultZoom}
              className="home-map"
              zoomControl={false}
              scrollWheelZoom={false}
              doubleClickZoom={false}
              dragging={false}
              touchZoom={false}
              keyboard={false}
            >
              <MapContent vendors={vendors} onMapClick={handleMapClick} />
            </MapContainer>
            <div className="home-map-overlay">
              <div className="home-map-cta">
                <span>Explorar Mapa Completo</span>
                <FiArrowUpRight size={18} />
              </div>
            </div>
          </>
        )}
      </div>
      <div className="home-map-section">
        <div className="home-map-text">
          <p className="home-map-subtitle">
            Tempo real • Sem instalar • Banhistas grátis
          </p>
        </div>
      </div>
    </div>
  );
}
