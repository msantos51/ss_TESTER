import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import axios from 'axios';
import { BASE_URL } from '../config';
import './ModernMapLayout.css';

export default function ModernMapLayout() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const PRODUCTS = ['Bolas de Berlim', 'Gelados', 'Acessórios de Praia'];
  const [selectedProducts, setSelectedProducts] = useState([...PRODUCTS]);
  const [selected, setSelected] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/vendors/`);
        setVendors(res.data);
      } catch (err) {
        console.error('Erro ao carregar vendedores:', err);
      }
    };
    fetchVendors();
  }, []);

  const activeVendors = vendors.filter((v) => v.current_lat && v.current_lng);
  const filteredVendors = activeVendors.filter((v) =>
    selectedProducts.includes(v.product)
  );

  const toggleProduct = (p) => {
    setSelectedProducts((prev) =>
      prev.includes(p) ? prev.filter((v) => v !== p) : [...prev, p]
    );
  };

  const focusVendor = (v) => {
    setSelected(v);
    if (mapRef.current) {
      mapRef.current.setView([v.current_lat, v.current_lng], 16);
    }
  };

  return (
    <div className="modern-layout">
      <aside className="sidebar">
        <h1 className="app-name">Sunny Sales</h1>
        <div className="login-buttons">
          <button
            className="login-btn"
            onClick={() => navigate('/vendor-login')}
          >
            Login Vendedor
          </button>
          <button className="login-btn" onClick={() => navigate('/login')}>
            Login Cliente
          </button>
        </div>

        <div className="filters">
          <h2 className="filters-title">Filtros</h2>
          <p className="filters-subtitle">Produto vendido</p>
          {PRODUCTS.map((p) => (
            <label key={p} className="filter-label">
              <input
                type="checkbox"
                checked={selectedProducts.includes(p)}
                onChange={() => toggleProduct(p)}
              />{' '}
              {p}
            </label>
          ))}
        </div>
      </aside>

      <main className="map-area">
        <MapContainer
          center={[38.7169, -9.1399]}
          zoom={13}
          className="map-container"
          whenCreated={(map) => {
            mapRef.current = map;
          }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; <a href='https://carto.com/'>Carto</a>, &copy; <a href='https://openstreetmap.org'>OpenStreetMap</a> contributors"
            subdomains="abcd"
            maxZoom={19}
          />
          {filteredVendors.map((v) => (
            <Marker
              key={v.id}
              position={[v.current_lat, v.current_lng]}
              icon={L.divIcon({
                className: 'vendor-pin',
                html: `<div style=\"background:${v.pin_color || '#FFB6C1'};width:16px;height:16px;border-radius:50%;\"></div>`,
              })}
              eventHandlers={{
                click: () => focusVendor(v),
              }}
            >
              <Popup>{v.name}</Popup>
            </Marker>
          ))}
        </MapContainer>

        {selected && (
          <div className="vendor-card">
            <div className="card-header">
              {selected.profile_photo ? (
                <img
                  src={`${BASE_URL}/${selected.profile_photo}`}
                  alt={selected.name}
                  className="card-photo"
                />
              ) : (
                <div
                  className="card-photo"
                  style={{ background: selected.pin_color || '#ccc' }}
                />
              )}
              <span className="badge">Ativo</span>
            </div>
            <h4 className="card-name">{selected.name}</h4>
            <p className="card-id">#{selected.id}</p>
            <p className="card-stats">
              📍 {selected.locations_count || 0} &nbsp; ⭐{' '}
              {selected.rating_average
                ? selected.rating_average.toFixed(1)
                : '--'}
            </p>
            <button className="map-btn" onClick={() => focusVendor(selected)}>
              VER NO MAPA
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
