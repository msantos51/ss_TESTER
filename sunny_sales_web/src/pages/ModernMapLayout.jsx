import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { BASE_URL } from '../config';
import LocateButton from '../components/LocateButton';
import VendorLocateButton from '../components/VendorLocateButton';
import LocateHint from '../components/LocateHint';
import BeachConditions from '../components/BeachConditions';
import { FiMapPin, FiFilter, FiCheck } from 'react-icons/fi';
import './ModernMapLayout.css';

const DISTANCE_OPTIONS = [
  { label: 'Todos', value: null },
  { label: '500 m', value: 500 },
  { label: '1 km', value: 1000 },
  { label: '2 km', value: 2000 },
  { label: '5 km', value: 5000 },
];

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

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

function ClientAutoFollow({ clientPos, isAutoFollowing, setIsAutoFollowing }) {
  const map = useMap();

  useEffect(() => {
    const onDragStart = () => setIsAutoFollowing(false);
    map.on('dragstart', onDragStart);
    return () => map.off('dragstart', onDragStart);
  }, [map, setIsAutoFollowing]);

  useEffect(() => {
    if (isAutoFollowing && clientPos?.lat && clientPos?.lng) {
      map.panTo([clientPos.lat, clientPos.lng]);
    }
  }, [clientPos?.lat, clientPos?.lng, isAutoFollowing, map]);

  return null;
}

function VendorAutoFollow({ vendor, isAutoFollowing, setIsAutoFollowing }) {
  const map = useMap();

  useEffect(() => {
    const onDragStart = () => setIsAutoFollowing(false);
    map.on('dragstart', onDragStart);
    return () => map.off('dragstart', onDragStart);
  }, [map, setIsAutoFollowing]);

  useEffect(() => {
    if (isAutoFollowing && vendor?.current_lat && vendor?.current_lng) {
      map.panTo([vendor.current_lat, vendor.current_lng]);
    }
  }, [vendor?.current_lat, vendor?.current_lng, isAutoFollowing, map]);

  return null;
}

export default function ModernMapLayout() {
  const [vendors, setVendors] = useState([]);
  const PRODUCTS = ['Bolas de Berlim', 'Gelados', 'Acessórios de Praia'];
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [maxDistance, setMaxDistance] = useState(null);
  const [selected, setSelected] = useState(null);

  const [filterOpen, setFilterOpen] = useState(false);
  const [pendingProducts, setPendingProducts] = useState([]);
  const [pendingDistance, setPendingDistance] = useState(null);

  const [clientPos, setClientPos] = useState(null);
  const [heading, setHeading] = useState(null);
  const lastHeadingTs = useRef(0);
  const smoothedHeadingRef = useRef(null);
  const absEventFiredRef = useRef(false);
  const gpsMovingRef = useRef(false);
  const [compassReady, setCompassReady] = useState(false);
  const [showLocateHint, setShowLocateHint] = useState(false);
  const isVendorLogged = !!localStorage.getItem('user');

  const mapRef = useRef(null);
  const [isAutoFollowing, setIsAutoFollowing] = useState(true);

  // Active filter count: selected products + distance set
  const activeFilterCount =
    selectedProducts.length + (maxDistance !== null ? 1 : 0);
  const pendingFilterCount =
    pendingProducts.length + (pendingDistance !== null ? 1 : 0);

  const openFilters = () => {
    setPendingProducts([...selectedProducts]);
    setPendingDistance(maxDistance);
    setFilterOpen(true);
  };

  const applyFilters = () => {
    setSelectedProducts([...pendingProducts]);
    setMaxDistance(pendingDistance);
    setFilterOpen(false);
  };

  const resetPending = () => {
    setPendingProducts([]);
    setPendingDistance(null);
  };

  const togglePendingProduct = (p) => {
    setPendingProducts((prev) =>
      prev.includes(p) ? prev.filter((v) => v !== p) : [...prev, p]
    );
  };

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
    const wsUrl = BASE_URL.replace(/^http/, 'ws') + '/ws/locations';
    const ws = new WebSocket(wsUrl);

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
    const COMPASS_ALPHA = 0.25;
    const MAX_ACCURACY_DEG = 25;

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

    const onOrientation = (e) => {
      if (gpsMovingRef.current) return;
      if (absEventFiredRef.current) return;
      const now = Date.now();
      if (now - lastHeadingTs.current < THROTTLE_MS) return;
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
    filteredVendors = activeVendors.filter((v) => {
      if (selectedProducts.length > 0 && !selectedProducts.includes(v.product)) return false;
      if (maxDistance !== null && clientPos) {
        const dist = haversineDistance(
          clientPos.lat, clientPos.lng,
          v.current_lat, v.current_lng
        );
        if (dist > maxDistance) return false;
      }
      return true;
    });
  }

  const focusVendor = (v) => {
    setSelected(v);
    if (mapRef.current) {
      mapRef.current.flyTo([v.current_lat, v.current_lng], 16);
    }
  };


  return (
    <div className="modern-layout">
      <div className="map-wrapper">
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
                <ClientAutoFollow
                  clientPos={clientPos}
                  isAutoFollowing={isAutoFollowing}
                  setIsAutoFollowing={setIsAutoFollowing}
                />
                <LocateButton
                  onLocationFound={(pos) => {
                    setClientPos(pos);
                    setIsAutoFollowing(true);
                  }}
                  onClick={() => setShowLocateHint(false)}
                />
                {showLocateHint && (
                  <LocateHint onClose={() => setShowLocateHint(false)} />
                )}
              </>
            )}

            {isVendorLogged && loggedVendor && (
              <>
                <VendorAutoFollow
                  vendor={loggedVendor}
                  isAutoFollowing={isAutoFollowing}
                  setIsAutoFollowing={setIsAutoFollowing}
                />
                <VendorLocateButton
                  vendor={loggedVendor}
                  onLocate={() => setIsAutoFollowing(true)}
                />
              </>
            )}
          </MapContainer>

          {/* Floating filter button */}
          {!isVendorLogged && (
            <button
              className={`filter-fab${activeFilterCount > 0 ? ' has-filters' : ''}`}
              onClick={openFilters}
              aria-label="Abrir filtros"
            >
              <FiFilter size={16} />
              <span>Filtrar{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
            </button>
          )}

          {/* Filter bottom sheet */}
          {filterOpen && !isVendorLogged && (
            <div className="filter-overlay" onClick={() => setFilterOpen(false)}>
              <div className="filter-sheet" onClick={(e) => e.stopPropagation()}>
                <div className="filter-sheet-handle" />
                <div className="filter-sheet-header">
                  <span className="filter-sheet-label">Filtrar por:</span>
                  <button
                    className="filter-close-btn"
                    onClick={() => setFilterOpen(false)}
                    aria-label="Fechar"
                  >
                    ×
                  </button>
                </div>

                {/* Products section */}
                <div className="filter-section">
                  <div className="filter-section-row">
                    <span className="filter-section-title">Vendedores</span>
                    <button
                      className="filter-reset-link"
                      onClick={() => setPendingProducts([])}
                    >
                      Repor
                    </button>
                  </div>
                  {PRODUCTS.map((p) => {
                    const active = pendingProducts.includes(p);
                    return (
                      <button
                        key={p}
                        className={`filter-option${active ? ' active' : ''}`}
                        onClick={() => togglePendingProduct(p)}
                      >
                        <span>{p}</span>
                        {active && <FiCheck size={14} className="filter-check" />}
                      </button>
                    );
                  })}
                </div>

                <div className="filter-divider" />

                {/* Distance section */}
                <div className="filter-section">
                  <div className="filter-section-row">
                    <span className="filter-section-title">
                      <FiMapPin size={14} style={{ marginRight: 6 }} />
                      Distância
                    </span>
                    <button
                      className="filter-reset-link"
                      onClick={() => setPendingDistance(null)}
                    >
                      Repor
                    </button>
                  </div>
                  <div className="filter-distance-row">
                    {DISTANCE_OPTIONS.map((opt) => (
                      <button
                        key={opt.label}
                        className={`filter-distance-opt${pendingDistance === opt.value ? ' active' : ''}`}
                        onClick={() => setPendingDistance(opt.value)}
                      >
                        {pendingDistance === opt.value && <FiCheck size={12} />}
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  {pendingDistance !== null && !clientPos && (
                    <p className="filter-distance-hint">
                      Ative a localização para filtrar por distância
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="filter-sheet-footer">
                  <button className="filter-reset-all-btn" onClick={resetPending}>
                    Repor Tudo
                  </button>
                  <button className="filter-apply-btn" onClick={applyFilters}>
                    Aplicar Filtros{pendingFilterCount > 0 ? ` (${pendingFilterCount})` : ''}
                  </button>
                </div>
              </div>
            </div>
          )}

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
