import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Geolocation } from '@capacitor/geolocation';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import AnimatedMarker from '../components/AnimatedMarker.jsx';
import useDeviceHeading from '../hooks/useDeviceHeading.js';

function getVendorLocationHtml(heading) {
  const hasHeading = heading !== null && !isNaN(heading);
  const arrow = hasHeading
    ? `<svg viewBox="0 0 20 20" width="10" height="10" style="display:block;flex-shrink:0;transform:rotate(${heading}deg);"><polygon points="10,1 6.5,14 10,11.5 13.5,14" fill="white"/></svg>`
    : '';
  return `<div class="vendor-location-marker"><div class="vendor-location-pulse"></div><div class="vendor-location-dot">${arrow}</div></div>`;
}

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
  const { heading, reportGpsHeading } = useDeviceHeading();
  const vendorIcon = useMemo(() => L.divIcon({
    className: '',
    html: getVendorLocationHtml(heading),
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  }), [heading]);

  useEffect(() => {
    let active = true;

    const start = async () => {
      try {
        const perm = await Geolocation.requestPermissions();
        if (perm.location !== 'granted') {
          if (active) setError('Permissão de localização negada. Ativa nas definições do telemóvel.');
          return;
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
              reportGpsHeading(pos.coords.heading, pos.coords.speed);
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
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://openstreetmap.org'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
          />
          <AnimatedMarker position={position} icon={vendorIcon} />
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
