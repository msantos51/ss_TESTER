import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { BASE_URL } from '../config';
import LocateButton from '../components/LocateButton';
import VendorLocateButton from '../components/VendorLocateButton';
import LocateHint from '../components/LocateHint';
import BeachConditions from '../components/BeachConditions';
import './ModernMapLayout.css';

// Layout principal com mapa e lista de vendedores online
export default function ModernMapLayout() {
  const [vendors, setVendors] = useState([]);
  const PRODUCTS = ['Bolas de Berlim', 'Gelados', 'Acessórios de Praia'];
  const [selectedProducts, setSelectedProducts] = useState([...PRODUCTS]);
  const [selected, setSelected] = useState(null);

  const [mapReady, setMapReady] = useState(false);
  const [clientPos, setClientPos] = useState(null);
  const [showLocateHint, setShowLocateHint] = useState(false);
  // Verifica se o utilizador autenticado é um vendedor. Se sim, ocultamos o
  // pin de cliente para evitar marcadores duplicados no mapa.
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
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isVendorLogged]);

  useEffect(() => {
    // Constrói o URL do WebSocket substituindo http por ws
    const wsUrl = BASE_URL.replace(/^http/, 'ws') + '/ws/locations';
    const ws = new WebSocket(wsUrl);

    // Recebe atualizações de localização em tempo real e atualiza o estado
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setVendors((prev) => {
        if (data.remove) {
          return prev.map((v) =>
            v.id === data.vendor_id
              ? { ...v, current_lat: null, current_lng: null }
              : v
          );
        }
        return prev.map((v) =>
          v.id === data.vendor_id
            ? { ...v, current_lat: data.lat, current_lng: data.lng }
            : v
        );
      });
    };

    // Fecha a ligação quando o componente é desmontado
    return () => {
      ws.close();
    };
  }, []);

  // Sempre que o mapa estiver pronto, acompanha a posição do utilizador
  // (vendedor ou cliente) e mantém o mapa centrado nessa localização.
  useEffect(() => {
    let watchId;
    if (mapReady && navigator.geolocation) {
      const updatePosition = (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setClientPos(coords);
        if (mapRef.current) {
          mapRef.current.setView([coords.lat, coords.lng]);
        }
      };

      watchId = navigator.geolocation.watchPosition(
        updatePosition,
        (err) => console.error('Erro localização:', err),
        { enableHighAccuracy: true, maximumAge: 1000 }
      );
    }
    return () => {
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, [mapReady]);


  const activeVendors = vendors.filter((v) => v.current_lat && v.current_lng);

  let loggedVendor = null;
  if (isVendorLogged) {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        const { id } = JSON.parse(stored);

        const vendorId = Number(id);
        loggedVendor =
          activeVendors.find((v) => Number(v.id) === vendorId) || null;

      }
    } catch (e) {
      console.error('Erro ao ler vendedor logado:', e);
    }
  }

  let filteredVendors = [];
  if (isVendorLogged) {
    filteredVendors = loggedVendor ? [loggedVendor] : [];
  } else {
    filteredVendors = activeVendors.filter((v) =>
      selectedProducts.includes(v.product)
    );
  }

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
      mapRef.current.flyTo([v.current_lat, v.current_lng], 16);
    }
  };


  return (
    <div className="modern-layout">
      <div className="map-wrapper">
        {!isVendorLogged && (
          <div className="filters">
            <p className="filters-subtitle">Vendedores:</p>
            {PRODUCTS.map((p, idx) => (
              <div key={p} className="checkbox-wrapper-46">
                <input
                  id={`filter-${idx}`}
                  type="checkbox"
                  className="inp-cbx"
                  checked={selectedProducts.includes(p)}
                  onChange={() => toggleProduct(p)}
                />
                <label htmlFor={`filter-${idx}`} className="cbx">
                  <span>
                    <svg viewBox="0 0 12 10">
                      <polyline points="1.5 6 4.5 9 10.5 1"></polyline>
                    </svg>
                  </span>
                  <span>{p}</span>
                </label>
              </div>
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
                html:
                  '<div style="background:#1976d2;width:24px;height:24px;border-radius:50%;border:2px solid white"></div>',
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
                html: `<div style="background:${v.pin_color || '#FFB6C1'};width:16px;height:16px;border-radius:50%;"></div>`,
              })}
              eventHandlers={{
                click: () => focusVendor(v),
              }}
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
          <div className="vendor-card">
            <button
              className="close-btn"
              onClick={() => setSelected(null)}
              aria-label="Fechar"
            >
              ×
            </button>
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
            <h4 className="card-name">{selected.name}</h4>
          </div>
        )}
      </main>
    </div>
    <BeachConditions />
  </div>
  );
}
