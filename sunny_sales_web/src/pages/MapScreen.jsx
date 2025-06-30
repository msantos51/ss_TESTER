// (em português) Versão Web do ecrã de mapa com vendedores ativos e filtros
import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { BASE_URL } from '../config';

// (em português) Função auxiliar para mudar a vista do mapa
function ChangeMapView({ coords, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, zoom);
  }, [coords]);
  return null;
}

export default function MapScreenWeb() {
  const [vendors, setVendors] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('Todos os vendedores');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [zoom, setZoom] = useState(13);

  // fetch vendors
  const fetchVendors = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/vendors/`);
      setVendors(res.data);
    } catch (err) {
      console.log('Erro ao carregar vendedores:', err);
    }
  };

  // localizar utilizador
  const locateUser = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserPosition(coords);
        setZoom(16);
      },
      (err) => {
        console.log('Erro ao obter localização:', err);
      },
      { enableHighAccuracy: true }
    );
  };

  // filtro
  const filteredVendors = vendors.filter((v) => {
    const matchProduct =
      selectedProduct === 'Todos os vendedores' || v.product === selectedProduct;
    const matchSearch =
      !searchQuery || v.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchProduct && matchSearch && v.current_lat && v.current_lng;
  });

  useEffect(() => {
    fetchVendors();
    locateUser();
  }, []);

  return (
    <div style={{ padding: '1rem' }}>
      <h2>🌞 Localização dos Vendedores</h2>

      <div style={{ marginBottom: '1rem' }}>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          style={{ marginRight: '1rem' }}
        >
          <option>Todos os vendedores</option>
          <option>Bolas de Berlim</option>
          <option>Acessórios</option>
          <option>Gelados</option>
        </select>

        <input
          type="text"
          placeholder="Procurar vendedor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div style={{ height: '500px', width: '100%' }}>
        <MapContainer center={[38.7169, -9.1399]} zoom={zoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {userPosition && <ChangeMapView coords={[userPosition.lat, userPosition.lng]} zoom={zoom} />}

          {userPosition && (
            <Marker
              position={[userPosition.lat, userPosition.lng]}
              icon={L.divIcon({
                className: 'user-pin',
                html: '<div style="background:#0077FF;width:16px;height:16px;border-radius:50%;border:2px solid white;"></div>',
              })}
            >
              <Popup>Você está aqui</Popup>
            </Marker>
          )}

          {filteredVendors.map((v) => (
            <Marker
              key={v.id}
              position={[v.current_lat, v.current_lng]}
              icon={L.divIcon({
                className: 'vendor-pin',
                html: v.profile_photo
                  ? `<div style="border:2px solid #f9c200;width:32px;height:32px;border-radius:50%;overflow:hidden;"><img src="${BASE_URL}/${v.profile_photo}" style="width:100%;height:100%;object-fit:cover;" /></div>`
                  : '<div style="background:#FFB6C1;width:16px;height:16px;border-radius:50%;"></div>',
              })}
              eventHandlers={{
                click: () => setSelectedVendorId(v.id),
              }}
            >
              <Popup>
                <strong>{v.name}</strong>
                <br />Produto: {v.product}
                {v.rating_average && <><br />★ {v.rating_average.toFixed(1)}</>}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
