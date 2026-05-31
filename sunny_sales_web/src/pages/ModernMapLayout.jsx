import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { BASE_URL } from '../config';
import LocateButton from '../components/LocateButton';
import VendorLocateButton from '../components/VendorLocateButton';
import LocateHint from '../components/LocateHint';
import BeachConditions from '../components/BeachConditions';
import { FiUsers, FiSettings, FiGlobe } from 'react-icons/fi';
import { GiIceCreamCone } from 'react-icons/gi';
import './ModernMapLayout.css';

const PRODUCT_ICONS = {
  'Bolas de Berlim': FiSettings,
  'Gelados': GiIceCreamCone,
  'Acessórios de Praia': FiGlobe,
};

function getClientPinHtml(heading) {
  const hasHeading = heading !== null && !isNaN(heading);
  const arrow = hasHeading
    ? `<svg viewBox="0 0 20 20" width="12" height="12" style="transform:rotate(${heading.toFixed(1)}deg);display:block;flex-shrink:0;"><polygon points="10,1 6.5,14 10,11.5 13.5,14" fill="white"/></svg>`
    : '';
  return `<div class="user-location-marker"><div class="user-location-pulse"></div><div class="user-location-dot">${arrow}</div></div>`;
}

function getVendorPinHtml(color, heading) {
  const hasHeading = heading !== null && !isNaN(heading);
  const arrow = hasHeading
    ? `<svg viewBox="0 0 20 20" width="12" height="12" style="transform:rotate(${heading.toFixed(1)}deg);display:block;flex-shrink:0;"><polygon points="10,1 6.5,14 10,11.5 13.5,14" fill="white"/></svg>`
    : '';
  return `<div class="vendor-location-marker"><div class="vendor-location-dot" style="background:${color}">${arrow}</div></div>`;
}

// Layout principal com mapa e lista de vendedores online
export default function ModernMapLayout() {
  const [vendors, setVendors] = useState([]);
  const PRODUCTS = ['Bolas de Berlim', 'Gelados', 'Acessórios de Praia'];
  const [selectedProducts, setSelectedProducts] = useState([...PRODUCTS]);
  const [selected, setSelected] = useState(null);

  const [clientPos, setClientPos] = useState(null);
  const [heading, setHeading] = useState(null);
  const lastHeadingTs = useRef(0);
  const smoothedHeadingRef = useRef(null);
  const absEventFiredRef = useRef(false); // true quando deviceorientationabsolute disparou
  const gpsMovingRef = useRef(false); // true quando GPS fornece heading válido
  const [compassReady, setCompassReady] = useState(false);
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

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setClientPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        const gpsH = pos.coords.heading;
        // GPS heading tem prioridade máxima quando o utilizador está em movimento
        if (gpsH != null && !isNaN(gpsH) && pos.coords.speed != null && pos.coords.speed > 0.3) {
          gpsMovingRef.current = true;
          smoothedHeadingRef.current = gpsH;
          setHeading(gpsH);
          lastHeadingTs.current = Date.now();
        } else {
          gpsMovingRef.current = false;
        }
      },
      (err) => console.error('Erro localização:', err),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // iOS 13+ requires a user gesture to call requestPermission for DeviceOrientationEvent.
  // Try immediately (works when permission was already granted in a previous visit);
  // if that throws (first visit), wait for the first touchstart anywhere on the page.
  useEffect(() => {
    if (
      typeof DeviceOrientationEvent === 'undefined' ||
      typeof DeviceOrientationEvent.requestPermission !== 'function'
    ) {
      setCompassReady(true);
      return;
    }

    let touchListener = null;

    const tryRequest = async () => {
      try {
        const result = await DeviceOrientationEvent.requestPermission();
        if (result === 'granted') setCompassReady(true);
      } catch {
        // Need a user gesture – attach a one-time touchstart listener
        touchListener = async () => {
          try {
            const r = await DeviceOrientationEvent.requestPermission();
            if (r === 'granted') setCompassReady(true);
          } catch (e) {
            console.error('Erro ao pedir permissão da bússola:', e);
          }
        };
        document.addEventListener('touchstart', touchListener, { once: true });
      }
    };

    tryRequest();

    return () => {
      if (touchListener) document.removeEventListener('touchstart', touchListener);
    };
  }, []);

  useEffect(() => {
    if (!compassReady) return;
    const THROTTLE_MS = 50;
    // Low-pass filter para suavizar o heading da bússola e reduzir jitter
    const COMPASS_ALPHA = 0.25;
    const MAX_ACCURACY_DEG = 25; // iOS webkitCompassAccuracy em graus

    const applySmoothing = (raw) => {
      const prev = smoothedHeadingRef.current;
      if (prev === null) {
        smoothedHeadingRef.current = raw;
        return raw;
      }
      let diff = raw - prev;
      if (diff > 180) diff -= 360;
      if (diff < -180) diff += 360;
      const next = (prev + COMPASS_ALPHA * diff + 360) % 360;
      smoothedHeadingRef.current = next;
      return next;
    };

    // deviceorientationabsolute: fonte mais fiável em Android (valores absolutos)
    const onAbsolute = (e) => {
      if (gpsMovingRef.current) return;
      if (e.alpha == null) return;
      const now = Date.now();
      if (now - lastHeadingTs.current < THROTTLE_MS) return;
      lastHeadingTs.current = now;
      absEventFiredRef.current = true;
      const raw = (360 - e.alpha) % 360;
      setHeading(applySmoothing(raw));
    };

    // deviceorientation: iOS Safari (webkitCompassHeading) e fallback Android
    const onOrientation = (e) => {
      if (gpsMovingRef.current) return;
      // Se deviceorientationabsolute já disparou, ignorar esta fonte (menos precisa)
      if (absEventFiredRef.current) return;
      const now = Date.now();
      if (now - lastHeadingTs.current < THROTTLE_MS) return;
      // Filtrar leituras iOS com baixa precisão de bússola
      if (e.webkitCompassAccuracy != null && e.webkitCompassAccuracy >= 0 && e.webkitCompassAccuracy > MAX_ACCURACY_DEG) return;
      lastHeadingTs.current = now;
      if (e.webkitCompassHeading != null) {
        setHeading(applySmoothing(e.webkitCompassHeading));
      } else if (e.alpha != null && e.absolute) {
        setHeading(applySmoothing((360 - e.alpha) % 360));
      }
    };

    window.addEventListener('deviceorientationabsolute', onAbsolute, true);
    window.addEventListener('deviceorientation', onOrientation, true);
    return () => {
      window.removeEventListener('deviceorientationabsolute', onAbsolute, true);
      window.removeEventListener('deviceorientation', onOrientation, true);
    };
  }, [compassReady]);


  const activeVendors = Array.isArray(vendors)
    ? vendors.filter((v) => v.current_lat && v.current_lng)
    : [];

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
            <div className="filters-header">
              <FiUsers size={15} />
              VENDEDORES
            </div>
            {PRODUCTS.map((p) => {
              const Icon = PRODUCT_ICONS[p];
              const active = selectedProducts.includes(p);
              return (
                <button
                  key={p}
                  className={`filter-list-item${active ? ' active' : ''}`}
                  onClick={() => toggleProduct(p)}
                >
                  {Icon && <Icon size={15} className="filter-list-icon" />}
                  <span>{p}</span>
                </button>
              );
            })}
          </div>
        )}

        <main className="map-area">
        <MapContainer
          ref={mapRef}
          center={[38.7169, -9.1399]}
          zoom={13}
          className="map-container"
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
                html: getClientPinHtml(heading),
                iconSize: [50, 50],
                iconAnchor: [25, 25],
              })}
            >
              <Popup>Você está aqui</Popup>
            </Marker>
          )}
          {filteredVendors.map((v) => {
            const isOwn = loggedVendor && Number(v.id) === Number(loggedVendor.id);
            const pinColor = v.pin_color || '#FFB6C1';
            return (
              <Marker
                key={v.id}
                position={[v.current_lat, v.current_lng]}
                icon={L.divIcon({
                  className: isOwn ? 'vendor-own-pin' : 'vendor-pin',
                  html: isOwn
                    ? getVendorPinHtml(pinColor, heading)
                    : `<div style="background:${pinColor};width:16px;height:16px;border-radius:50%;"></div>`,
                  iconSize: isOwn ? [50, 50] : [16, 16],
                  iconAnchor: isOwn ? [25, 25] : [8, 8],
                })}
                eventHandlers={{
                  click: () => focusVendor(v),
                }}
              />
            );
          })}

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
