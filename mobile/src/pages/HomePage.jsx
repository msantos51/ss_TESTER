import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { BASE_URL } from '../config.js';
import AnimatedMarker from '../components/AnimatedMarker.jsx';

function hexToRgba(hex, alpha) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  if (!match) return `rgba(75, 163, 195, ${alpha})`;
  const [r, g, b] = match.slice(1).map((h) => parseInt(h, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function getVendorLocationHtml(color) {
  const pinColor = color || '#4BA3C3';
  const pulseColor = hexToRgba(pinColor, 0.28);
  return `<div class="vendor-location-marker"><div class="vendor-location-pulse" style="background:${pulseColor};"></div><div class="vendor-location-dot" style="background:${pinColor};"></div></div>`;
}

function MapCenter({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
}

const PRODUCT_TYPES = [
  { id: 'bebidas', label: 'Bebidas', icon: '🥤', color: '#4BA3C3' },
  { id: 'gelados', label: 'Gelados', icon: '🍦', color: '#FF6B9D' },
  { id: 'frutas', label: 'Frutas', icon: '🍎', color: '#2ECC71' },
  { id: 'comida', label: 'Comida', icon: '🍔', color: '#F39C12' },
  { id: 'acessorios', label: 'Acessórios', icon: '👜', color: '#9B59B6' },
  { id: 'outros', label: 'Outros', icon: '📦', color: '#95A5A6' },
];

export default function HomePage() {
  const [vendors, setVendors] = useState([]);
  const [userPosition, setUserPosition] = useState([38.7223, -9.1393]); // Lisboa default
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState(new Set());
  const [maxDistance, setMaxDistance] = useState(5);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [weather, setWeather] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    const loadVendors = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/vendors/public`);
        if (!response.ok) throw new Error('Erro ao carregar vendedores');
        const data = await response.json();
        setVendors(data);
      } catch (err) {
        setError(err.message);
        console.error('Erro ao carregar vendedores:', err);
      } finally {
        setLoading(false);
      }
    };

    loadVendors();
  }, []);

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${userPosition[0]}&longitude=${userPosition[1]}&current=temperature_2m,weather_code&timezone=Europe/Lisbon`
        );
        const data = await response.json();
        setWeather(data.current);
      } catch (err) {
        console.error('Erro ao carregar dados meteorológicos:', err);
      }
    };

    loadWeather();
  }, [userPosition]);

  const filteredVendors = useMemo(() => {
    if (selectedFilters.size === 0) return vendors;
    return vendors.filter((v) => {
      const vendorCategories = v.product_types || [];
      return Array.from(selectedFilters).some((filter) =>
        vendorCategories.includes(filter)
      );
    });
  }, [vendors, selectedFilters]);

  const toggleFilter = (filterId) => {
    const newFilters = new Set(selectedFilters);
    if (newFilters.has(filterId)) {
      newFilters.delete(filterId);
    } else {
      newFilters.add(filterId);
    }
    setSelectedFilters(newFilters);
  };

  const getWeatherIcon = () => {
    if (!weather) return '☁️';
    const code = weather.weather_code;
    if (code === 0 || code === 1) return '☀️';
    if (code === 2 || code === 3) return '⛅';
    if (code >= 45 && code <= 48) return '🌫️';
    if (code >= 51 && code <= 67) return '🌧️';
    if (code >= 71 && code <= 77) return '❄️';
    if (code >= 80 && code <= 82) return '⛈️';
    return '☁️';
  };

  return (
    <div className="home-page">
      {/* Header */}
      <header className="home-header">
        <div className="header-container">
          <div className="logo-section">
            <div className="logo">☀️ Sunny Sales</div>
          </div>
          <nav className="header-nav">
            <a href="#about">Sobre o Projecto</a>
            <a href="#sustainability">Sustentabilidade</a>
            <a href="#plans">Planos</a>
            <a href="#vendors">Para Vendedores</a>
            <a href="#faq">FAQs</a>
            <a href="#contact">Contacto</a>
          </nav>
          <div className="header-actions">
            <button className="btn-icon">👤</button>
            <button className="btn btn-primary explore-btn">Explorar Mapa</button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="home-container">
        {/* Left sidebar - Filters */}
        <aside className="home-sidebar-left">
          <div className="filters-section">
            <h3>Filtros</h3>
            <input
              type="text"
              placeholder="Pesquisar produto ou vendedor..."
              className="filter-search"
            />

            <div className="filter-group">
              <h4>Tipo de Produto</h4>
              <div className="filter-options">
                {PRODUCT_TYPES.map((type) => (
                  <label key={type.id} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedFilters.has(type.id)}
                      onChange={() => toggleFilter(type.id)}
                    />
                    <span className="filter-icon">{type.icon}</span>
                    <span>{type.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <h4>Distância</h4>
              <div className="distance-slider">
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={maxDistance}
                  onChange={(e) => setMaxDistance(Number(e.target.value))}
                  className="slider"
                />
                <span className="distance-value">
                  {maxDistance <= 50 ? `Todos` : `${maxDistance} km`}
                </span>
              </div>
            </div>

            <div className="notifications-toggle">
              <input type="checkbox" id="notifications" defaultChecked />
              <label htmlFor="notifications">
                Ativa as notificações<br />
                <small>Recebe alertas quando vêm vendedores perto</small>
              </label>
            </div>

            <button className="btn-link">Limpar</button>
          </div>
        </aside>

        {/* Center - Map */}
        <div className="home-map-section">
          <div className="map-wrapper">
            {loading ? (
              <div className="map-loading">
                <span className="loading-dots"><span /><span /><span /></span>
                <p>A carregar vendedores…</p>
              </div>
            ) : error ? (
              <div className="map-error">
                <p>{error}</p>
              </div>
            ) : (
              <MapContainer
                center={userPosition}
                zoom={13}
                className="map-container"
                zoomControl={true}
                ref={mapRef}
              >
                <TileLayer
                  url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png"
                  attribution="&copy; <a href='https://base.org'>base</a> contributors"
                />

                {/* User position marker */}
                <Marker
                  position={userPosition}
                  icon={L.icon({
                    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIxNiIgY3k9IjE2IiByPSIxMiIgZmlsbD0iIzRCQTNDMyIgb3BhY2l0eT0iMC4zIi8+PGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iNiIgZmlsbD0iIzRCQTNDMyIvPjwvc3ZnPg==',
                    iconSize: [32, 32],
                    iconAnchor: [16, 16],
                  })}
                >
                  <Popup>Sua localização</Popup>
                </Marker>

                {/* Vendor markers */}
                {filteredVendors.map((vendor) => (
                  vendor.lat && vendor.lng && (
                    <Marker
                      key={vendor.id}
                      position={[vendor.lat, vendor.lng]}
                      icon={L.divIcon({
                        className: '',
                        html: getVendorLocationHtml(vendor.pin_color),
                        iconSize: [40, 40],
                        iconAnchor: [20, 20],
                      })}
                      eventHandlers={{
                        click: () => setSelectedVendor(vendor),
                      }}
                    >
                      <Popup>
                        <div className="vendor-popup">
                          <h4>{vendor.name}</h4>
                          <p>{vendor.business_type || 'Vendedor'}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}

                <MapCenter center={userPosition} zoom={13} />
              </MapContainer>
            )}
          </div>

          {/* Weather footer */}
          {weather && (
            <div className="weather-info">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              <span>{getWeatherIcon()} {weather.temperature_2m}°C</span>
              <span className="time">18:08</span>
              <span className="date">Hoje, 1 de Julho</span>
              <span className="location">Lisboa</span>
            </div>
          )}
        </div>

        {/* Right sidebar - Vendor list */}
        <aside className="home-sidebar-right">
          <div className="vendors-list-header">
            <h3>Vendedores perto de ti</h3>
            <span className="vendor-count">{filteredVendors.length} abertos agora</span>
          </div>

          <div className="vendors-list">
            {filteredVendors.length === 0 ? (
              <div className="no-vendors">
                <p>Nenhum vendedor encontrado</p>
              </div>
            ) : (
              filteredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className={`vendor-card ${selectedVendor?.id === vendor.id ? 'selected' : ''}`}
                  onClick={() => setSelectedVendor(vendor)}
                >
                  <div className="vendor-avatar-small" style={{ borderColor: vendor.pin_color }}>
                    {vendor.name?.charAt(0)?.toUpperCase() || 'V'}
                  </div>
                  <div className="vendor-info">
                    <h4>{vendor.name}</h4>
                    <p className="vendor-type">{vendor.business_type || 'Vendedor'}</p>
                    <p className="vendor-status">
                      <span className="status-dot online" />
                      Online agora
                    </p>
                  </div>
                  <div className="vendor-meta">
                    <span className="distance">~200 m</span>
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </div>
                </div>
              ))
            )}
          </div>

          <button className="btn btn-block btn-primary">Ver todos os vendedores →</button>
        </aside>
      </div>
    </div>
  );
}
