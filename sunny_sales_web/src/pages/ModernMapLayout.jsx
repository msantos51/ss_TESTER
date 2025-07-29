import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import axios from 'axios';
import { BASE_URL } from '../config';
import './ModernMapLayout.css';

// Layout principal com mapa e lista de vendedores online
export default function ModernMapLayout() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const PRODUCTS = ['Bolas de Berlim', 'Gelados', 'Acessórios de Praia'];
  const [selectedProducts, setSelectedProducts] = useState([...PRODUCTS]);
  const [selected, setSelected] = useState(null);
  const [favorite, setFavorite] = useState(false);
  const [locating, setLocating] = useState(false);
  const mapRef = useRef(null);
  const loggedIn = !!localStorage.getItem('client');

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

  // Pede permissão para usar a localização quando o layout é carregado
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {},
        () => {},
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    if (selected) {
      const stored = JSON.parse(localStorage.getItem('favorites') || '[]');
      setFavorite(stored.includes(selected.id));
    }
  }, [selected]);

  const activeVendors = vendors.filter((v) => v.current_lat && v.current_lng);
  const filteredVendors = activeVendors.filter((v) =>
    selectedProducts.includes(v.product)
  );

  // Alterna a seleção de um produto no filtro
  const toggleProduct = (p) => {
    setSelectedProducts((prev) =>
      prev.includes(p) ? prev.filter((v) => v !== p) : [...prev, p]
    );
  };

  // Centraliza o mapa no vendedor selecionado
  const focusVendor = (v) => {
    setSelected(v);
    if (mapRef.current) {
      mapRef.current.setView([v.current_lat, v.current_lng], 16);
    }
  };

  // Marca ou desmarca o vendedor como favorito
  const toggleFavorite = () => {
    if (!selected) return;
    const stored = JSON.parse(localStorage.getItem('favorites') || '[]');
    let updated;
    if (stored.includes(selected.id)) {
      updated = stored.filter((id) => id !== selected.id);
      setFavorite(false);
    } else {
      updated = [...stored, selected.id];
      setFavorite(true);
    }
    localStorage.setItem('favorites', JSON.stringify(updated));
  };

  const handleLocate = () => {
    if (!navigator.geolocation || !mapRef.current) {
      alert('Geolocalização não suportada.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        mapRef.current.flyTo([latitude, longitude], 16);
      },
      () => {
        setLocating(false);
        alert('Não foi possível obter a localização.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="modern-layout">
      <div className="filters">
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
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
            attribution="&copy; <a href='https://openstreetmap.org'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
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

        <button
          className="locate-btn"
          onClick={handleLocate}
          aria-label="Localizar-me"
        >
          {locating ? <span className="loader" /> : '📍'}
        </button>

        {selected && (
          <div className="vendor-card">
            <button
              className="close-btn"
              onClick={() => setSelected(null)}
              aria-label="Fechar"
            >
              ×
            </button>
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
            {loggedIn && (
              <button className="map-btn" onClick={toggleFavorite}>
                {favorite ? '★ Remover dos Favoritos' : '☆ Adicionar aos Favoritos'}
              </button>
            )}
          </div>
        )}
      </main>

      <div className="online-vendors">
        <h2 className="vendors-title">Vendedores Online</h2>
        {filteredVendors.map((v) => (
          <div
            key={v.id}
            className="vendor-entry"
            onClick={() => focusVendor(v)}
          >
            {v.profile_photo ? (
              <img
                src={`${BASE_URL}/${v.profile_photo}`}
                alt={v.name}
                className="vendor-avatar"
              />
            ) : (
              <div
                className="vendor-avatar"
                style={{ background: v.pin_color || '#ccc' }}
              />
            )}
            <div>
              <p className="vendor-name">{v.name}</p>
              <p className="vendor-rating">
                ⭐ {v.rating_average ? v.rating_average.toFixed(1) : '--'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
