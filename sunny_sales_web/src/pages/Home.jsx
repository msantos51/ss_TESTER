import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-rotate';
import axios from 'axios';
import { BASE_URL, mediaUrl, TILE_LAYER } from '../config';
import LocateButton from '../components/LocateButton';
import LocateHint from '../components/LocateHint';
import WelcomeCard from '../components/WelcomeCard';
import WeatherCard from '../components/WeatherCard';
import BeachMapVisuals from '../components/BeachMapVisuals';
import {
  FiMapPin, FiTag, FiShoppingBag,
  FiSmartphone, FiCreditCard,
  FiSliders, FiCheck, FiX,
} from 'react-icons/fi';
import { TbCurrencyEuro } from 'react-icons/tb';
import './Home.css';

const PAYMENT_ICONS = {
  'MB Way':      FiSmartphone,
  'Numerário':   TbCurrencyEuro,
  'Cartão':      FiCreditCard,
};

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

function AnimatedVendorMarker({ position, icon, eventHandlers }) {
  const markerRef = useRef(null);
  const displayedRef = useRef(position);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) {
      displayedRef.current = position;
      return;
    }
    const from = displayedRef.current;
    const to = position;
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);

    const duration = 500;
    const start = performance.now();

    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const lat = from[0] + (to[0] - from[0]) * t;
      const lng = from[1] + (to[1] - from[1]) * t;
      marker.setLatLng([lat, lng]);
      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        displayedRef.current = to;
      }
    };
    animFrameRef.current = requestAnimationFrame(step);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position[0], position[1]]);

  return (
    <Marker ref={markerRef} position={displayedRef.current} icon={icon} eventHandlers={eventHandlers} />
  );
}

function getClientPinHtml(heading, color) {
  const hasHeading = heading !== null && !isNaN(heading);
  const arrow = hasHeading
    ? `<svg viewBox="0 0 20 20" width="12" height="12" style="display:block;flex-shrink:0;"><polygon points="10,1 6.5,14 10,11.5 13.5,14" fill="white"/></svg>`
    : '';
  const safeColor = color ? escapeHtml(color) : '';
  const pulseStyle = safeColor ? ` style="background:${safeColor}33;"` : '';
  const dotStyle = safeColor ? ` style="background:${safeColor};box-shadow:0 2px 8px ${safeColor}88;"` : '';
  return `<div class="user-location-marker"><div class="user-location-pulse"${pulseStyle}></div><div class="user-location-dot"${dotStyle}>${arrow}</div></div>`;
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function getVendorPinHtml(color) {
  const safeColor = escapeHtml(color);
  return `<div class="vendor-pin-marker" style="--pin-color: ${safeColor};"></div>`;
}

function MapZoomA11y() {
  const map = useMap();
  useEffect(() => {
    const zoomIn = map.zoomControl?._zoomInButton;
    const zoomOut = map.zoomControl?._zoomOutButton;
    if (zoomIn) {
      zoomIn.setAttribute('aria-label', 'Aproximar mapa');
      zoomIn.title = 'Aproximar mapa';
    }
    if (zoomOut) {
      zoomOut.setAttribute('aria-label', 'Afastar mapa');
      zoomOut.title = 'Afastar mapa';
    }
  }, [map]);
  return null;
}

function MapBearingController({ targetBearingRef }) {
  const map = useMap();
  useEffect(() => {
    const current = { val: null };
    let rafId;
    const LERP = 0.18;

    const tick = () => {
      const target = targetBearingRef.current;
      if (target !== null && !isNaN(target)) {
        if (current.val === null) {
          current.val = target;
          map.setBearing(target);
        } else {
          let diff = target - current.val;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;
          if (Math.abs(diff) > 0.08) {
            current.val = (current.val + diff * LERP + 360) % 360;
            map.setBearing(current.val);
          }
        }
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [map, targetBearingRef]);
  return null;
}

function ClientAutoFollow({ clientPos, isAutoFollowing, setIsAutoFollowing }) {
  const map = useMap();

  useEffect(() => {
    const onUserInteraction = (e) => {
      if (e.target.closest('button, a, .leaflet-control')) return;
      setIsAutoFollowing(false);
    };
    const container = map.getContainer();
    container.addEventListener('mousedown', onUserInteraction);
    container.addEventListener('touchstart', onUserInteraction, { passive: true });
    return () => {
      container.removeEventListener('mousedown', onUserInteraction);
      container.removeEventListener('touchstart', onUserInteraction);
    };
  }, [map, setIsAutoFollowing]);

  useEffect(() => {
    if (isAutoFollowing && clientPos?.lat && clientPos?.lng) {
      map.setView([clientPos.lat, clientPos.lng], map.getZoom(), { animate: false });
    }
  }, [clientPos?.lat, clientPos?.lng, isAutoFollowing, map]);

  return null;
}

function VendorAutoFollow({ vendor, isAutoFollowing, setIsAutoFollowing }) {
  const map = useMap();

  useEffect(() => {
    const onUserInteraction = (e) => {
      if (e.target.closest('button, a, .leaflet-control')) return;
      setIsAutoFollowing(false);
    };
    const container = map.getContainer();
    container.addEventListener('mousedown', onUserInteraction);
    container.addEventListener('touchstart', onUserInteraction, { passive: true });
    return () => {
      container.removeEventListener('mousedown', onUserInteraction);
      container.removeEventListener('touchstart', onUserInteraction);
    };
  }, [map, setIsAutoFollowing]);

  useEffect(() => {
    if (isAutoFollowing && vendor?.current_lat && vendor?.current_lng) {
      map.setView([vendor.current_lat, vendor.current_lng], map.getZoom(), { animate: false });
    }
  }, [vendor?.current_lat, vendor?.current_lng, isAutoFollowing, map]);

  return null;
}

export default function Home() {
  const [vendors, setVendors] = useState([]);
  const PRODUCTS = ['Bolas de Berlim', 'Gelados', 'Acessórios de Praia'];
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [maxDistance, setMaxDistance] = useState(null);
  const [selected, setSelected] = useState(null);
  const [vendorProducts, setVendorProducts] = useState([]);

  const [pendingProducts, setPendingProducts] = useState([]);
  const [pendingDistance, setPendingDistance] = useState(null);

  const [clientPos, setClientPos] = useState(null);
  const [heading, setHeading] = useState(null);
  const lastHeadingTs = useRef(0);
  const targetBearingRef = useRef(null);
  const absEventFiredRef = useRef(false);
  const gpsMovingRef = useRef(false);
  const [compassReady, setCompassReady] = useState(false);
  const [showCompassModal, setShowCompassModal] = useState(false);
  const [showLocateHint, setShowLocateHint] = useState(false);
  const isVendorLogged = !!localStorage.getItem('user');

  const mapRef = useRef(null);
  const [isAutoFollowing, setIsAutoFollowing] = useState(true);

  const [showWelcome, setShowWelcome] = useState(
    () => !localStorage.getItem('welcomeSeen')
  );

  const dismissWelcome = () => {
    localStorage.setItem('welcomeSeen', '1');
    setShowWelcome(false);
  };

  const toggleProduct = (p) => {
    setSelectedProducts((prev) =>
      prev.includes(p) ? prev.filter((v) => v !== p) : [...prev, p]
    );
  };

  const resetFilters = () => {
    setSelectedProducts([]);
    setMaxDistance(null);
  };

  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [tilesLoaded, setTilesLoaded] = useState(false);

  useEffect(() => {
    if (tilesLoaded) return undefined;
    const t = setTimeout(() => setTilesLoaded(true), 6000);
    return () => clearTimeout(t);
  }, [tilesLoaded]);

  const activeFilterCount =
    selectedProducts.length + (maxDistance !== null ? 1 : 0);

  const openFilterSheet = () => {
    setPendingProducts(selectedProducts);
    setPendingDistance(maxDistance);
    setShowFilterSheet(true);
  };
  const closeFilterSheet = () => setShowFilterSheet(false);
  const togglePendingProduct = (p) => {
    setPendingProducts((prev) =>
      prev.includes(p) ? prev.filter((v) => v !== p) : [...prev, p]
    );
  };
  const resetPendingFilters = () => {
    setPendingProducts([]);
    setPendingDistance(null);
  };
  const applyFilters = () => {
    setSelectedProducts(pendingProducts);
    setMaxDistance(pendingDistance);
    setShowFilterSheet(false);
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
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const wsUrl = BASE_URL.replace(/^http/, 'ws') + `/ws/locations?token=${encodeURIComponent(token)}`;
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
          const mappedGpsH = (360 - gpsH) % 360;
          targetBearingRef.current = mappedGpsH;
          setHeading(mappedGpsH);
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

  useEffect(() => {
    if (
      typeof DeviceOrientationEvent === 'undefined' ||
      typeof DeviceOrientationEvent.requestPermission !== 'function'
    ) {
      setCompassReady(true);
      return;
    }

    DeviceOrientationEvent.requestPermission()
      .then((result) => {
        if (result === 'granted') {
          setCompassReady(true);
        } else {
          const dismissed = localStorage.getItem('compass_modal_dismissed');
          if (!dismissed) setShowCompassModal(true);
        }
      })
      .catch(() => {
        const dismissed = localStorage.getItem('compass_modal_dismissed');
        if (!dismissed) setShowCompassModal(true);
      });
  }, []);

  const requestCompassPermission = async () => {
    try {
      const result = await DeviceOrientationEvent.requestPermission();
      if (result === 'granted') {
        setCompassReady(true);
      }
    } catch (e) {
      console.error('Erro ao pedir permissão da bússola:', e);
    } finally {
      setShowCompassModal(false);
      localStorage.setItem('compass_modal_dismissed', 'true');
    }
  };

  const dismissCompassModal = () => {
    setShowCompassModal(false);
    localStorage.setItem('compass_modal_dismissed', 'true');
  };

  useEffect(() => {
    if (!compassReady) return;
    const THROTTLE_MS = 16;
    const MARKER_THROTTLE_MS = 100;
    const MAX_ACCURACY_DEG = 50;
    let lastMarkerTs = 0;

    const onAbsolute = (e) => {
      if (gpsMovingRef.current) return;
      if (e.alpha == null) return;
      const now = Date.now();
      if (now - lastHeadingTs.current < THROTTLE_MS) return;
      lastHeadingTs.current = now;
      absEventFiredRef.current = true;
      const raw = e.alpha % 360;
      targetBearingRef.current = raw;
      if (now - lastMarkerTs > MARKER_THROTTLE_MS) {
        lastMarkerTs = now;
        setHeading(raw);
      }
    };

    const onOrientation = (e) => {
      if (gpsMovingRef.current) return;
      if (absEventFiredRef.current) return;
      const now = Date.now();
      if (now - lastHeadingTs.current < THROTTLE_MS) return;
      if (e.webkitCompassAccuracy != null && e.webkitCompassAccuracy >= 0 && e.webkitCompassAccuracy > MAX_ACCURACY_DEG) return;
      lastHeadingTs.current = now;
      let raw = null;
      if (e.webkitCompassHeading != null) {
        raw = (360 - e.webkitCompassHeading) % 360;
      } else if (e.alpha != null && e.absolute) {
        raw = e.alpha % 360;
      }
      if (raw !== null) {
        targetBearingRef.current = raw;
        if (now - lastMarkerTs > MARKER_THROTTLE_MS) {
          lastMarkerTs = now;
          setHeading(raw);
        }
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
  let loggedVendorData = null;
  if (isVendorLogged) {
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        loggedVendorData = JSON.parse(stored);
        const { id } = loggedVendorData;
        const vendorId = Number(id);
        loggedVendor =
          activeVendors.find((v) => Number(v.id) === vendorId) || null;
      }
    } catch (e) {
      console.error('Erro ao ler vendedor logado:', e);
    }
  }

  const nearbyVendorsCount = (!isVendorLogged && clientPos)
    ? activeVendors.filter((v) =>
        haversineDistance(clientPos.lat, clientPos.lng, v.current_lat, v.current_lng) <= 100
      ).length
    : null;

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
      mapRef.current.flyTo([v.current_lat, v.current_lng], 18, { animate: true, duration: 0.5 });
    }
  };

  useEffect(() => {
    if (!selected) { setVendorProducts([]); return; }
    axios.get(`${BASE_URL}/vendors/${selected.id}/products`)
      .then(res => setVendorProducts(res.data))
      .catch(e => console.error('Erro ao carregar produtos do vendedor:', e));
  }, [selected]);

  return (
    <div className="home">
      <div className="modern-layout">
        {!isVendorLogged && <div className="sidebar-left">
          <div className="sidebar-filters">
            <div className="filter-header">
              <h3 className="filter-title">Filtros</h3>
              <button className="filter-clear-btn" onClick={resetFilters}>
                Limpar
              </button>
            </div>

            <div className="filter-section">
              <h4 className="filter-category-title">Tipo de Produto</h4>
              {PRODUCTS.map((p) => {
                const active = selectedProducts.includes(p);
                return (
                  <label key={p} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={() => toggleProduct(p)}
                    />
                    <span className="checkbox-label">{p}</span>
                  </label>
                );
              })}
            </div>

            <div className="filter-divider" />

            <div className="filter-section">
              <h4 className="filter-category-title">
                <FiMapPin size={14} style={{ marginRight: 6 }} />
                Distância
              </h4>
              {DISTANCE_OPTIONS.map((opt) => (
                <label key={opt.label} className="filter-radio">
                  <input
                    type="radio"
                    name="distance"
                    checked={maxDistance === opt.value}
                    onChange={() => setMaxDistance(opt.value)}
                  />
                  <span className="radio-label">{opt.label}</span>
                </label>
              ))}
              {maxDistance !== null && !clientPos && (
                <p className="filter-hint">Ative a localização para filtrar</p>
              )}
            </div>
          </div>
        </div>}

        <div className="map-wrapper">
          {!isVendorLogged && (
            <h1 className="map-tagline">
              Acompanhe os vendedores de praia em tempo real.
            </h1>
          )}
          <section className="map-area" aria-label="Mapa de vendedores">
            <MapContainer
              ref={mapRef}
              center={[38.7169, -9.1399]}
              zoom={13}
              className="map-container"
              rotate={true}
              bearing={0}
            >
              <MapZoomA11y />
              <MapBearingController targetBearingRef={targetBearingRef} />
              <TileLayer
                {...TILE_LAYER}
                eventHandlers={{ load: () => setTilesLoaded(true) }}
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
                const pinColor = v.pin_color || '#7B61FF';
                return (
                  <AnimatedVendorMarker
                    key={v.id}
                    position={[v.current_lat, v.current_lng]}
                    icon={isOwn
                      ? L.divIcon({
                          className: 'client-pin',
                          html: getClientPinHtml(heading, pinColor),
                          iconSize: [50, 50],
                          iconAnchor: [25, 25],
                        })
                      : L.divIcon({
                          className: 'vendor-pin',
                          html: getVendorPinHtml(pinColor),
                          iconSize: [30, 37],
                          iconAnchor: [15, 36],
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
                    currentPos={clientPos}
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

              {loggedVendor && (
                <VendorAutoFollow
                  vendor={loggedVendor}
                  isAutoFollowing={isAutoFollowing}
                  setIsAutoFollowing={setIsAutoFollowing}
                />
              )}

              {isVendorLogged && loggedVendorData && (
                <LocateButton
                  type="vendor"
                  data={loggedVendor}
                  onClick={() => setIsAutoFollowing(true)}
                />
              )}
            </MapContainer>

            <div
              className={`map-skeleton${tilesLoaded ? ' map-skeleton--hidden' : ''}`}
              aria-hidden="true"
            >
              <div className="map-skeleton-card">
                <span className="map-skeleton-pin">
                  <FiMapPin size={19} />
                </span>
                A carregar o mapa…
              </div>
            </div>

            {showCompassModal && (
              <div className="compass-modal-overlay" onClick={dismissCompassModal}>
                <div className="compass-modal" onClick={(e) => e.stopPropagation()}>
                  <div className="compass-modal-icon">🧭</div>
                  <h3 className="compass-modal-title">Orientação Automática</h3>
                  <p className="compass-modal-desc">
                    Para o mapa rodar conforme a direção que estás a olhar, precisa de acesso à bússola do dispositivo.
                  </p>
                  <button className="compass-allow-btn" onClick={requestCompassPermission}>
                    Permitir Bússola
                  </button>
                  <button className="compass-skip-btn" onClick={dismissCompassModal}>
                    Agora não
                  </button>
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
                    src={mediaUrl(selected.profile_photo)}
                    alt={selected.name}
                    className="card-photo"
                  />
                ) : (
                  <div
                    className="card-photo card-photo--placeholder"
                    style={{ background: selected.pin_color || '#ccc' }}
                  />
                )}
                <h4 className="card-name">{selected.name}</h4>
                {selected.product && (
                  <div className="card-product">
                    <FiTag size={12} />
                    <span>{selected.product}</span>
                  </div>
                )}
                {selected.payment_methods && (
                  <div className="card-payments">
                    {selected.payment_methods.split(',').map((m) => {
                      const method = m.trim();
                      const Icon = PAYMENT_ICONS[method];
                      return Icon ? (
                        <span key={method} className="card-payment-chip">
                          <Icon size={13} />
                          <span className="card-payment-label">{method}</span>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
                {vendorProducts.length > 0 && (
                  <div className="card-products">
                    <div className="card-products-title">
                      <FiShoppingBag size={13} />
                      <span>Produtos disponíveis</span>
                    </div>
                    <div className="card-products-list">
                      {vendorProducts.map((p) => (
                        <div key={p.id} className="card-product-item">
                          {p.photo ? (
                            <img src={mediaUrl(p.photo)} alt={p.name} className="card-product-photo" />
                          ) : (
                            <div className="card-product-photo card-product-photo--placeholder">
                              <FiShoppingBag size={14} />
                            </div>
                          )}
                          <span className="card-product-name">{p.name}</span>
                          <span className="card-product-price">{p.price.toFixed(2)} €</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="weather-overlay">
              <WeatherCard />
            </div>

            {!isVendorLogged && (
              <button
                type="button"
                className={`filter-fab${activeFilterCount > 0 ? ' has-filters' : ''}`}
                onClick={openFilterSheet}
                aria-label="Abrir filtros"
              >
                <FiSliders size={16} />
                Filtros
                {activeFilterCount > 0 && <span>({activeFilterCount})</span>}
              </button>
            )}

            {!isVendorLogged && showFilterSheet && (
              <div className="filter-overlay" onClick={closeFilterSheet}>
                <div className="filter-sheet" onClick={(e) => e.stopPropagation()}>
                  <div className="filter-sheet-handle" />
                  <div className="filter-sheet-header">
                    <span className="filter-sheet-label">Filtros</span>
                    <button
                      type="button"
                      className="filter-back-btn"
                      onClick={closeFilterSheet}
                      aria-label="Fechar filtros"
                    >
                      <FiX size={18} /> Fechar
                    </button>
                  </div>

                  <div className="filter-sheet-body">
                    <div className="filter-section">
                      <div className="filter-section-row">
                        <span className="filter-section-title">Tipo de produto</span>
                      </div>
                      {PRODUCTS.map((p) => {
                        const active = pendingProducts.includes(p);
                        return (
                          <button
                            key={p}
                            type="button"
                            className={`filter-option${active ? ' active' : ''}`}
                            onClick={() => togglePendingProduct(p)}
                          >
                            <FiShoppingBag className="filter-option-icon" size={16} />
                            {p}
                            {active && <FiCheck className="filter-check" size={16} />}
                          </button>
                        );
                      })}
                    </div>

                    <div className="filter-divider" />

                    <div className="filter-section">
                      <div className="filter-section-row">
                        <span className="filter-section-title">Distância</span>
                      </div>
                      <div className="filter-distance-row">
                        {DISTANCE_OPTIONS.map((opt) => (
                          <button
                            key={opt.label}
                            type="button"
                            className={`filter-distance-opt${pendingDistance === opt.value ? ' active' : ''}`}
                            onClick={() => setPendingDistance(opt.value)}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      {pendingDistance !== null && !clientPos && (
                        <p className="filter-distance-hint">
                          Ativa a localização para filtrar por distância.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="filter-sheet-footer">
                    <button
                      type="button"
                      className="filter-reset-all-btn"
                      onClick={resetPendingFilters}
                    >
                      Limpar
                    </button>
                    <button
                      type="button"
                      className="filter-apply-btn"
                      onClick={applyFilters}
                    >
                      Aplicar
                    </button>
                  </div>
                </div>
              </div>
            )}

          </section>
        </div>

        {!isVendorLogged && <div className="sidebar-right">
          <div className="vendors-panel">
            <div className="vendors-header">
              <h3 className="vendors-title">Vendedores perto de ti</h3>
              {nearbyVendorsCount !== null && (
                <span className="vendors-count">{nearbyVendorsCount} por perto</span>
              )}
            </div>

            <div className="vendors-list">
              {filteredVendors.length === 0 ? (
                <div className="vendors-empty">
                  <FiMapPin size={24} />
                  <p>Nenhum vendedor encontrado</p>
                </div>
              ) : (
                filteredVendors.map((v) => (
                  <div
                    key={v.id}
                    className={`vendor-item ${selected?.id === v.id ? 'active' : ''}`}
                    onClick={() => focusVendor(v)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Ver vendedor ${v.name} no mapa`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        focusVendor(v);
                      }
                    }}
                  >
                    {v.profile_photo ? (
                      <img
                        src={mediaUrl(v.profile_photo)}
                        alt={v.name}
                        className="vendor-item-photo"
                      />
                    ) : (
                      <div
                        className="vendor-item-photo vendor-item-photo--placeholder"
                        style={{ background: v.pin_color || '#ccc' }}
                      />
                    )}
                    <div className="vendor-item-info">
                      <h4 className="vendor-item-name">{v.name}</h4>
                      {v.product && (
                        <p className="vendor-item-product">{v.product}</p>
                      )}
                      {clientPos && (
                        <p className="vendor-item-distance">
                          {(haversineDistance(clientPos.lat, clientPos.lng, v.current_lat, v.current_lng) / 1000).toFixed(1)} km
                        </p>
                      )}
                    </div>
                    {v.payment_methods && (
                      <div className="vendor-item-payments">
                        {v.payment_methods.split(',').slice(0, 2).map((m) => {
                          const method = m.trim();
                          const Icon = PAYMENT_ICONS[method];
                          return Icon ? (
                            <Icon key={method} size={16} />
                          ) : null;
                        })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>}

        {showWelcome && <WelcomeCard onClose={dismissWelcome} />}
      </div>
    </div>
  );
}
