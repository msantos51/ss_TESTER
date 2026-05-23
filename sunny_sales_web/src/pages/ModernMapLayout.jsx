import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { BASE_URL } from '../config';
import LocateButton from '../components/LocateButton';
import VendorLocateButton from '../components/VendorLocateButton';
import LocateHint from '../components/LocateHint';
import BeachConditions from '../components/BeachConditions';
import './ModernMapLayout.css';

const PRODUCT_EMOJI = {
  'Bolas de Berlim': '🍩',
  'Gelados': '🍦',
  'Acessórios de Praia': '🏖️',
};

export default function ModernMapLayout() {
  const [vendors, setVendors] = useState([]);
  const PRODUCTS = ['Bolas de Berlim', 'Gelados', 'Acessórios de Praia'];
  const [selectedProducts, setSelectedProducts] = useState([...PRODUCTS]);
  const [selected, setSelected] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [clientPos, setClientPos] = useState(null);
  const [showLocateHint, setShowLocateHint] = useState(false);
  const isVendorLogged = !!localStorage.getItem('user');
  const mapRef = useRef(null);

  useEffect(() => {
    if (!isVendorLogged) {
      const seen = localStorage.getItem('locate_hint_seen');
      if (!seen) {
        setShowLocateHint(true);
        localStorage.setItem('locate_hint_seen', 'true');
      }
    }
  }, [isVendorLogged]);

  useEffect(() => {
    let interval;
    const fetchVendors = async () => {
      try {
        const headers = {};
        if (isVendorLogged) {
          const token = localStorage.getItem('token');
          if (token) headers.Authorization = `Bearer ${token}`;
        }
        const res = await axios.get(`${BASE_URL}/vendors/`, { headers });
        setVendors(res.data);
      } catch (err) {
        console.error('Erro ao carregar vendedores:', err);
      }
    };
    fetchVendors();
    interval = setInterval(fetchVendors, 1000);
    return () => { if (interval) clearInterval(interval); };
  }, [isVendorLogged]);

  useEffect(() => {
    const wsUrl = BASE_URL.replace(/^http/, 'ws') + '/ws/locations';
    const ws = new WebSocket(wsUrl);
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setVendors((prev) => {
        if (data.remove) {
          return prev.map((v) =>
            v.id === data.vendor_id ? { ...v, current_lat: null, current_lng: null } : v
          );
        }
        return prev.map((v) =>
          v.id === data.vendor_id
            ? { ...v, current_lat: data.lat, current_lng: data.lng }
            : v
        );
      });
    };
    return () => ws.close();
  }, []);

  useEffect(() => {
    let watchId;
    if (mapReady && navigator.geolocation) {
      const updatePosition = (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setClientPos(coords);
        if (mapRef.current) mapRef.current.setView([coords.lat, coords.lng]);
      };
      watchId = navigator.geolocation.watchPosition(
        updatePosition,
        (err) => console.error('Erro localização:', err),
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
    }
    return () => { if (watchId !== undefined) navigator.geolocation.clearWatch(watchId); };
  }, [mapReady]);

  const activeVendors = vendors.filter((v) => v.current_lat && v.current_lng);

  let loggedVendor = null;
  if (isVendorLogged) {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const { id } = JSON.parse(stored);
        const vendorId = Number(id);
        loggedVendor = activeVendors.find((v) => Number(v.id) === vendorId) || null;
      }
    } catch (e) {
      console.error('Erro ao ler vendedor logado:', e);
    }
  }

  let filteredVendors = [];
  if (isVendorLogged) {
    filteredVendors = loggedVendor ? [loggedVendor] : [];
  } else {
    filteredVendors = activeVendors.filter((v) => selectedProducts.includes(v.product));
  }

  const toggleProduct = (p) => {
    setSelectedProducts((prev) =>
      prev.includes(p) ? prev.filter((v) => v !== p) : [...prev, p]
    );
  };

  const focusVendor = (v) => {
    setSelected(v);
    if (mapRef.current) mapRef.current.flyTo([v.current_lat, v.current_lng], 16);
  };

  const makeVendorIcon = (v) =>
    L.divIcon({
      className: 'vendor-pin',
      html: `<div class="vendor-marker" style="background:${v.pin_color || '#FCB454'}">
        <span>${PRODUCT_EMOJI[v.product] || '🛍️'}</span>
      </div>`,
      iconSize: [40, 48],
      iconAnchor: [20, 48],
    });

  return (
    <div className="modern-layout">
      <div className="map-wrapper">
        {!isVendorLogged && (
          <div className="filter-bar">
            <span className="filter-count">
              {filteredVendors.length} online
            </span>
            {PRODUCTS.map((p) => (
              <button
                key={p}
                className={`filter-pill${selectedProducts.includes(p) ? ' active' : ''}`}
                onClick={() => toggleProduct(p)}
              >
                {PRODUCT_EMOJI[p]} {p}
              </button>
            ))}
          </div>
        )}

        <main className="map-area">
          <MapContainer
            center={[38.7169, -9.1399]}
            zoom={13}
            className="map-container"
            whenCreated={(map) => {
              mapRef.current = map;
              setMapReady(true);
            }}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
              attribution="&copy; <a href='https://openstreetmap.org'>OpenStreetMap</a> contributors &copy; <a href='https://carto.com/attributions'>CARTO</a>"
              subdomains="abcd"
              maxZoom={19}
            />

            {!isVendorLogged && clientPos && (
              <Marker
                position={[clientPos.lat, clientPos.lng]}
                icon={L.divIcon({
                  className: 'client-pin',
                  html: '<div class="client-marker"></div>',
                  iconSize: [22, 22],
                  iconAnchor: [11, 11],
                })}
              >
                <Popup>Você está aqui</Popup>
              </Marker>
            )}

            {filteredVendors.map((v) => (
              <Marker
                key={v.id}
                position={[v.current_lat, v.current_lng]}
                icon={makeVendorIcon(v)}
                eventHandlers={{ click: () => focusVendor(v) }}
              />
            ))}

            {!isVendorLogged && (
              <>
                <LocateButton
                  onLocationFound={setClientPos}
                  onClick={() => setShowLocateHint(false)}
                />
                {showLocateHint && (
                  <LocateHint onClose={() => setShowLocateHint(false)} />
                )}
              </>
            )}

            {isVendorLogged && loggedVendor && (
              <VendorLocateButton vendor={loggedVendor} />
            )}
          </MapContainer>

          {selected && (
            <div className="vendor-popup">
              <button
                className="close-btn popup-close"
                onClick={() => setSelected(null)}
                aria-label="Fechar"
              >
                ×
              </button>
              <div className="popup-content">
                {selected.profile_photo ? (
                  <img
                    src={`${BASE_URL}/${selected.profile_photo}`}
                    alt={selected.name}
                    className="popup-photo"
                  />
                ) : (
                  <div
                    className="popup-photo popup-photo-placeholder"
                    style={{ background: selected.pin_color || '#FCB454' }}
                  >
                    {selected.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div className="popup-info">
                  <h4 className="popup-name">{selected.name}</h4>
                  <span className="popup-product">
                    {PRODUCT_EMOJI[selected.product] || '🛍️'} {selected.product}
                  </span>
                </div>
              </div>
              <Link to={`/vendors/${selected.id}`} className="popup-profile-link">
                Ver Perfil →
              </Link>
            </div>
          )}
        </main>
      </div>
      <BeachConditions />
    </div>
  );
}
