import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { BASE_URL } from '../config';
import './ModernMapLayout.css';

// Componente principal que implementa o layout moderno com sidebar, mapa e cartão flutuante
export default function ModernMapLayout() {
  const [vendors, setVendors] = useState([]);
  const [search, setSearch] = useState('');
  const PRODUCTS = ['Bolas de Berlim', 'Acessórios', 'Gelados'];
  const [selectedProducts, setSelectedProducts] = useState([...PRODUCTS]);
  const [selected, setSelected] = useState(null);
  const mapRef = useRef(null);

  // Carrega vendedores do backend
  const fetchVendors = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/vendors/`);
      setVendors(res.data);
    } catch (err) {
      console.error('Erro ao carregar vendedores:', err);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  // Lista de favoritos guardada no localStorage
  const favoriteIds = JSON.parse(localStorage.getItem('favorites') || '[]');
  const favorites = vendors.filter((v) => favoriteIds.includes(v.id));

  const activeVendors = vendors.filter((v) => v.current_lat && v.current_lng);

  const filteredActive = activeVendors.filter(
    (v) =>
      v.name?.toLowerCase().includes(search.toLowerCase()) &&
      (selectedProducts.length === 0 || selectedProducts.includes(v.product))
  );

  const focusVendor = (v) => {
    setSelected(v);
    if (mapRef.current) {
      mapRef.current.setView([v.current_lat, v.current_lng], 16);
    }
  };

  return (
    <div className="layout">
      {/* Sidebar lateral esquerda */}
      <aside className="sidebar">
        <h2 className="sidebar-title">Vendedores</h2>
        <input
          className="search-input"
          type="text"
          placeholder="Filtrar..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="product-filters">
          <label>
            <input
              type="checkbox"
              checked={selectedProducts.length === PRODUCTS.length}
              onChange={() =>
                setSelectedProducts((prev) =>
                  prev.length === PRODUCTS.length ? [] : [...PRODUCTS]
                )
              }
            />{' '}
            Todos
          </label>
          {PRODUCTS.map((p) => (
            <label key={p}>
              <input
                type="checkbox"
                checked={selectedProducts.includes(p)}
                onChange={() =>
                  setSelectedProducts((prev) =>
                    prev.includes(p)
                      ? prev.filter((v) => v !== p)
                      : [...prev, p]
                  )
                }
              />{' '}
              {p}
            </label>
          ))}
        </div>

        <div className="section">
          <h3 className="section-title">Ativos</h3>
          <ul className="vendor-list">
            {filteredActive.map((v) => (
              <li key={v.id} className="vendor-item" onClick={() => focusVendor(v)}>
                <div className="vendor-info">
                  {v.profile_photo ? (
                    <img
                      src={`${BASE_URL}/${v.profile_photo}`}
                      alt={v.name}
                      className="avatar"
                    />
                  ) : (
                    <div className="avatar" style={{ background: v.pin_color || '#ccc' }} />
                  )}
                  <span className="vendor-name">{v.name}</span>
                </div>
                <span className="vendor-time">~{v.approx_time || '--'}m</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="section">
          <h3 className="section-title">Favoritos</h3>
          <ul className="vendor-list">
            {favorites.map((v) => (
              <li key={v.id} className="vendor-item" onClick={() => focusVendor(v)}>
                <div className="vendor-info">
                  {v.profile_photo ? (
                    <img
                      src={`${BASE_URL}/${v.profile_photo}`}
                      alt={v.name}
                      className="avatar"
                    />
                  ) : (
                    <div className="avatar" style={{ background: v.pin_color || '#ccc' }} />
                  )}
                  <span className="vendor-name">{v.name}</span>
                </div>
                <span className="vendor-time">★</span>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {/* Área principal do mapa */}
      <main className="map-area">
        <MapContainer
          center={[38.7169, -9.1399]}
          zoom={13}
          style={{ height: '66vh', width: '100%' }}
          whenCreated={(map) => {
            mapRef.current = map;
          }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {activeVendors.map((v) => (
            <Marker
              key={v.id}
              position={[v.current_lat, v.current_lng]}
              icon={L.divIcon({
                className: 'vendor-pin',
                html: `<div style="background:${v.pin_color || '#FFB6C1'};width:16px;height:16px;border-radius:50%;"></div>`,
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
              {selected.rating_average ? selected.rating_average.toFixed(1) : '--'}
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
