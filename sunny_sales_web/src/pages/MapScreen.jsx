// (em português) Versão Web do ecrã de mapa com vendedores ativos e filtros com checkboxes personalizados
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import { BASE_URL } from '../config';
import './MapScreen.css';

function ChangeMapView({ coords, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (coords) map.setView(coords, zoom);
  }, [coords]);
  return null;
}

export default function MapScreenWeb() {
  const [vendors, setVendors] = useState([]);
  const PRODUCTS = ['Bolas de Berlim', 'Acessórios', 'Gelados'];
  const [selectedProducts, setSelectedProducts] = useState([...PRODUCTS]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVendorId, setSelectedVendorId] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [zoom, setZoom] = useState(13);
  const [mapCenter, setMapCenter] = useState([38.7169, -9.1399]);
  const [vendorUser, setVendorUser] = useState(null);
  const [clientUser, setClientUser] = useState(null);
  const navigate = useNavigate();

  const loadVendor = () => {
    const stored = localStorage.getItem('user');
    if (stored) setVendorUser(JSON.parse(stored));
  };

  const loadClient = () => {
    const stored = localStorage.getItem('client');
    if (stored) setClientUser(JSON.parse(stored));
  };

  const fetchVendors = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/vendors/`);
      setVendors(res.data);
    } catch (err) {
      console.log('Erro ao carregar vendedores:', err);
    }
  };

  const locateUser = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setUserPosition(coords);
        setMapCenter([coords.lat, coords.lng]);
        setZoom(16);
      },
      (err) => {
        console.log('Erro ao obter localização:', err);
      },
      { enableHighAccuracy: true }
    );
  };

  const filteredVendors = vendors.filter((v) => {
    const matchProduct =
      selectedProducts.length === 0 || selectedProducts.includes(v.product);
    const matchSearch =
      !searchQuery || v.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchProduct && matchSearch && v.current_lat && v.current_lng;
  });

  useEffect(() => {
    fetchVendors();
    locateUser();
    loadVendor();
    loadClient();
  }, []);

  return (
    <div style={{ padding: '1rem', position: 'relative' }}>
      <h2>Localização dos Vendedores</h2>

      <div className="filter-container">
        <label key="all" className="checkbox-container">
          Todos
          <input
            type="checkbox"
            className="custom-checkbox"
            checked={selectedProducts.length === PRODUCTS.length}
            onChange={() =>
              setSelectedProducts((prev) =>
                prev.length === PRODUCTS.length ? [] : [...PRODUCTS]
              )
            }
          />
          <span className="checkmark"></span>
        </label>

        {PRODUCTS.map((p) => (
          <label key={p} className="checkbox-container">
            {p}
            <input
              type="checkbox"
              className="custom-checkbox"
              checked={selectedProducts.includes(p)}
              onChange={() =>
                setSelectedProducts((prev) =>
                  prev.includes(p) ? prev.filter((v) => v !== p) : [...prev, p]
                )
              }
            />
            <span className="checkmark"></span>
          </label>
        ))}

        <input
          type="text"
          placeholder="Procurar vendedor..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />
      </div>

      <div style={{ height: '500px', width: '100%' }}>
        <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <ChangeMapView coords={mapCenter} zoom={zoom} />

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
                  ? `<div style="border:2px solid ${v.pin_color || '#f9c200'};width:32px;height:32px;border-radius:50%;overflow:hidden;"><img src="${BASE_URL}/${v.profile_photo}" style="width:100%;height:100%;object-fit:cover;" /></div>`
                  : `<div style="background:${v.pin_color || '#FFB6C1'};width:16px;height:16px;border-radius:50%;"></div>`,
              })}
              eventHandlers={{
                click: () => {
                  setSelectedVendorId(v.id);
                  setMapCenter([v.current_lat, v.current_lng]);
                  setZoom(17);
                },
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

      <ul className="vendor-list">
        {filteredVendors.map((v) => (
          <li
            key={v.id}
            onClick={() => {
              setSelectedVendorId(v.id);
              setMapCenter([v.current_lat, v.current_lng]);
              setZoom(17);
            }}
            className="vendor-item"
          >
            {v.profile_photo && (
              <img
                src={`${BASE_URL}/${v.profile_photo}`}
                style={{ width: 32, height: 32, borderRadius: 16, marginRight: 8 }}
              />
            )}
            <span>
              {v.name}
              {v.rating_average != null ? ` – ${v.rating_average.toFixed(1)}★` : ''}
            </span>
          </li>
        ))}
      </ul>

      <button style={styles.locateButton} onClick={locateUser}>🎯</button>
      <button style={styles.vendorIcon} onClick={() => navigate(vendorUser ? '/dashboard' : '/vendor-login')}>👤</button>

      <div style={styles.buttonsContainer}>
        {clientUser ? (
          <button className="btn" style={styles.button} onClick={() => navigate('/dashboard')}>Perfil</button>
        ) : (
          <>
            <button className="btn" style={styles.button} onClick={() => navigate('/login')}>Iniciar sessão Cliente</button>
            <button className="btn" style={styles.outlinedButton} onClick={() => navigate('/register')}>Registar Cliente</button>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  vendorIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '50%',
    padding: '0.5rem',
    cursor: 'pointer',
  },
  locateButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    borderRadius: '50%',
    padding: '0.5rem',
    cursor: 'pointer',
  },
  buttonsContainer: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '1rem',
  },
  button: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f9c200',
    border: 'none',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  outlinedButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#fff',
    border: '1px solid #ccc',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
};
