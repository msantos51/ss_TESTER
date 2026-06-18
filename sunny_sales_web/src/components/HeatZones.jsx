import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';
import axios from 'axios';
import { BASE_URL } from '../config';

const REFRESH_MS = 15000;
// Gradiente em tons de laranja (sem azul/verde) para a "nuvem" de zonas quentes.
const ORANGE_GRADIENT = {
  0.2: '#ffd9a0',
  0.4: '#ffb24d',
  0.6: '#ff8c1a',
  0.8: '#ff6a00',
  1.0: '#e64a00',
};

// Camada de mapa com zonas quentes (concentração de visitantes), visível apenas para vendedores.
export default function HeatZones() {
  const map = useMap();
  const layerRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    const fetchZones = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get(`${BASE_URL}/presence/heatmap`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (cancelled) return;

        const points = res.data.map((z) => [z.lat, z.lng, Math.min(z.count, 10)]);

        if (!layerRef.current) {
          layerRef.current = L.heatLayer(points, {
            radius: 45,
            blur: 35,
            maxZoom: 17,
            minOpacity: 0.35,
            gradient: ORANGE_GRADIENT,
          }).addTo(map);
        } else {
          layerRef.current.setLatLngs(points);
        }
      } catch (err) {
        console.error('Erro ao carregar zonas quentes:', err);
      }
    };

    fetchZones();
    const interval = setInterval(fetchZones, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
      if (layerRef.current) {
        map.removeLayer(layerRef.current);
        layerRef.current = null;
      }
    };
  }, [map]);

  return null;
}
