import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import { Geolocation } from '@capacitor/geolocation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const vendorIcon = L.divIcon({
  className: '',
  html: '<div class="vendor-location-marker"><div class="vendor-location-pulse"></div><div class="vendor-location-dot"></div></div>',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

function FollowPosition({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom() < 15 ? 16 : map.getZoom());
  }, [position, map]);
  return null;
}

export default function MapView() {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const watchIdRef = useRef(null);

  useEffect(() => {
    let active = true;

    const start = async () => {
      try {
        const perm = await Geolocation.requestPermissions();
        if (perm.location !== 'granted') {
          if (active) setError('Permissão de localização negada. Ativa nas definições do telemóvel.');
          return;
        }
        // Pede já uma posição rápida (baixa precisão) para mostrar o mapa sem
        // esperar pela primeira leitura de GPS de alta precisão, que pode demorar muito.
        try {
          const quickPos = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 5000 });
          if (active && quickPos) {
            setPosition([quickPos.coords.latitude, quickPos.coords.longitude]);
          }
        } catch {
          // ignora; o watchPosition abaixo continua a tentar
        }
        watchIdRef.current = await Geolocation.watchPosition(
          { enableHighAccuracy: true },
          (pos, err) => {
            if (!active) return;
            if (err) {
              setError('Não foi possível obter a localização.');
              return;
            }
            if (pos) {
              setError(null);
              setPosition([pos.coords.latitude, pos.coords.longitude]);
            }
          }
        );
      } catch {
        if (active) setError('Não foi possível obter a localização.');
      }
    };

    start();

    return () => {
      active = false;
      if (watchIdRef.current != null) Geolocation.clearWatch({ id: watchIdRef.current });
    };
  }, []);

  return (
    <div className="screen map-screen">
      {error && <div className="alert alert-warning map-overlay-alert">{error}</div>}

      {position ? (
        <MapContainer center={position} zoom={16} className="map-container" zoomControl={false}>
          <TileLayer
            url="https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://openstreetmap.org'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
          />
          <Marker position={position} icon={vendorIcon} />
          <FollowPosition position={position} />
        </MapContainer>
      ) : (
        !error && (
          <div className="map-loading">
            <span className="loading-dots">
              <span /><span /><span />
            </span>
            <p>A obter a tua localização…</p>
          </div>
        )
      )}
    </div>
  );
}
