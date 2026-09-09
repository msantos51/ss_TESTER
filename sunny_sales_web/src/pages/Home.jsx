import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-rotate';
import axios from 'axios';
import { BASE_URL, mediaUrl, TILE_LAYER } from '../config';
import LocateButton from '../components/LocateButton';
import WeatherCard from '../components/WeatherCard';
import {
  FiMapPin, FiTag, FiShoppingBag,
  FiSmartphone, FiCreditCard,
  FiSliders, FiCheck, FiX, FiMap, FiList,
} from 'react-icons/fi';
import { TbCurrencyEuro } from 'react-icons/tb';
import './Home.css';

const PAYMENT_ICONS = {
  'MB Way':      FiSmartphone,
  'Numerário':   TbCurrencyEuro,
  'Cartão':      FiCreditCard,
};

// (em português) Última posição conhecida desta sessão. Permite abrir o mapa
// já na praia do utilizador em vez de Lisboa, sem esperar pelo primeiro fix
// de GPS — que em 4G congestionada pode demorar vários segundos.
const LAST_POS_KEY = 'last_pos';
const FALLBACK_CENTER = [38.7169, -9.1399];

// (em português) Abaixo de 768px o cartão de meteorologia não é desenhado.
// Esconder por CSS não chegava: o componente continuaria montado e a fazer os
// seus dois pedidos de rede no arranque, que é exatamente o que se quer
// evitar numa 4G congestionada de verão.
function useIsNarrow() {
  const query = '(max-width: 768px)';
  const [narrow, setNarrow] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setNarrow(e.matches);
    mq.addEventListener('change', onChange);
    setNarrow(mq.matches);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return narrow;
}

function readLastPos() {
  try {
    const raw = sessionStorage.getItem(LAST_POS_KEY);
    if (!raw) return null;
    const { lat, lng } = JSON.parse(raw);
    if (typeof lat !== 'number' || typeof lng !== 'number') return null;
    return { lat, lng };
  } catch {
    return null;
  }
}

function writeLastPos(lat, lng) {
  try {
    sessionStorage.setItem(LAST_POS_KEY, JSON.stringify({ lat, lng }));
  } catch {
    /* sessionStorage indisponível (modo privado): não é crítico */
  }
}

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

// A gota deixa de ser um anel grosso e passa a ser sólida com um miolo
// branco — a mesma leitura à distância, menos ruído quando há muitos pins
// juntos, e a cor do vendedor ocupa mais área (é o que se procura no mapa).
function getVendorPinHtml(color) {
  const safeColor = escapeHtml(color);
  return `<div class="vendor-pin-marker" style="--pin-color: ${safeColor};"><span class="vendor-pin-core"></span></div>`;
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

// (em português) Sem posição guardada e sem fix de GPS, o mapa abria em
// Lisboa. Assim que a lista de vendedores chega, enquadra os que estão ativos
// — é a melhor aproximação disponível do sítio onde o utilizador está, e é
// abandonada mal o GPS responda ou o utilizador arraste o mapa.
function VendorsFallbackView({ vendors, clientPos, enabled }) {
  const map = useMap();
  const doneRef = useRef(false);

  useEffect(() => {
    if (!enabled || doneRef.current || clientPos) return;
    if (!vendors.length) return;
    doneRef.current = true;
    if (vendors.length === 1) {
      map.setView([vendors[0].current_lat, vendors[0].current_lng], 15, { animate: false });
      return;
    }
    const bounds = L.latLngBounds(
      vendors.map((v) => [v.current_lat, v.current_lng])
    );
    map.fitBounds(bounds, { padding: [56, 56], maxZoom: 16, animate: false });
  }, [enabled, vendors, clientPos, map]);

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

  const mapRef = useRef(null);
  const isNarrow = useIsNarrow();
  const [isAutoFollowing, setIsAutoFollowing] = useState(true);

  // (em português) Mapa ou lista. Em desktop a lista é uma coluna à direita e
  // está aberta por omissão; em telemóvel é um painel que cobre o mapa, por
  // isso arranca fechado — quem chega por QR code veio ver o mapa.
  const [viewMode, setViewMode] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches
      ? 'map'
      : 'list'
  );

  // Abre onde o utilizador estava, não em Lisboa. Só é lido uma vez, no
  // primeiro render, porque o Leaflet ignora alterações posteriores a `center`.
  const initialViewRef = useRef(null);
  if (initialViewRef.current === null) {
    const last = readLastPos();
    initialViewRef.current = last
      ? { center: [last.lat, last.lng], zoom: 16 }
      : { center: FALLBACK_CENTER, zoom: 13 };
  }
  const initialView = initialViewRef.current;
  const hadLastPos = useRef(
    initialViewRef.current.center !== FALLBACK_CENTER
  ).current;

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
    // Em 4G congestionada é melhor mostrar o mapa parcialmente carregado do
    // que um retângulo cinzento: a sessão típica dura menos de 30 segundos.
    const t = setTimeout(() => setTilesLoaded(true), 2500);
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
    let interval;
    const fetchVendors = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/vendors/`);
        setVendors(res.data);
      } catch (err) {
        console.error('Erro ao carregar vendedores:', err);
      }
    };
    fetchVendors();
    // As atualizações de posição chegam em tempo real pelo WebSocket. Este
    // fetch periódico é apenas uma rede de segurança para descobrir vendedores
    // que entram/saem e para ressincronizar — daí o intervalo longo (15s) em
    // vez do polling agressivo de 1s que sobrecarregava o servidor.
    interval = setInterval(fetchVendors, 15000);
    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  // Canal em tempo real (WebSocket): recebe as atualizações de posição dos
  // vendedores sem necessidade de polling constante. Está aberto a qualquer
  // visitante (os dados difundidos são públicos, os mesmos de GET /vendors/) e
  // reconecta-se automaticamente se a ligação cair.
  useEffect(() => {
    let ws;
    let reconnectTimer;
    let closedByUnmount = false;

    const applyUpdate = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      setVendors((prev) =>
        prev.map((v) =>
          v.id === data.vendor_id
            ? {
                ...v,
                current_lat: data.remove ? null : data.lat,
                current_lng: data.remove ? null : data.lng,
              }
            : v
        )
      );
    };

    const scheduleReconnect = () => {
      if (closedByUnmount) return;
      clearTimeout(reconnectTimer);
      reconnectTimer = setTimeout(connect, 3000);
    };

    function connect() {
      if (closedByUnmount) return;
      const wsUrl = BASE_URL.replace(/^http/, 'ws') + '/ws/locations';
      try {
        ws = new WebSocket(wsUrl);
      } catch {
        scheduleReconnect();
        return;
      }
      ws.onmessage = applyUpdate;
      ws.onclose = scheduleReconnect;
      ws.onerror = () => {
        try {
          ws.close();
        } catch {
          /* noop */
        }
      };
    }

    connect();

    return () => {
      closedByUnmount = true;
      clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null;
        try {
          ws.close();
        } catch {
          /* noop */
        }
      }
    };
  }, []);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setClientPos({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        writeLastPos(pos.coords.latitude, pos.coords.longitude);
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

  // (em português) Nos navegadores que não exigem permissão explícita a bússola
  // fica disponível de imediato. Onde é exigida (iOS/Safari), o pedido não é
  // feito no arranque: a rotação do mapa é um extra e não deve estar à frente
  // do mapa. É pedido no primeiro toque no botão de localização, que já é um
  // gesto do utilizador — precisamente o que o iOS exige para conceder.
  useEffect(() => {
    if (
      typeof DeviceOrientationEvent === 'undefined' ||
      typeof DeviceOrientationEvent.requestPermission !== 'function'
    ) {
      setCompassReady(true);
    }
  }, []);

  const requestCompassPermission = async () => {
    if (
      compassReady ||
      typeof DeviceOrientationEvent === 'undefined' ||
      typeof DeviceOrientationEvent.requestPermission !== 'function'
    ) {
      return;
    }
    try {
      const result = await DeviceOrientationEvent.requestPermission();
      if (result === 'granted') setCompassReady(true);
    } catch (e) {
      console.error('Erro ao pedir permissão da bússola:', e);
    }
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

  const nearbyVendorsCount = clientPos
    ? activeVendors.filter((v) =>
        haversineDistance(clientPos.lat, clientPos.lng, v.current_lat, v.current_lng) <= 100
      ).length
    : null;

  const filteredVendors = activeVendors.filter((v) => {
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

  const focusVendor = (v) => {
    setSelected(v);
    if (mapRef.current) {
      mapRef.current.flyTo([v.current_lat, v.current_lng], 18, { animate: true, duration: 0.5 });
    }
    // Em telemóvel a lista cobre o mapa: escolher um vendedor volta ao mapa.
    if (isNarrow) setViewMode('map');
  };

  // Ação principal do painel de pesquisa: enquadra no mapa exatamente o que os
  // filtros deixaram de fora — sem isto, escolher "5 km" não mostra nada de
  // novo se os vendedores estiverem fora do enquadramento atual.
  const showFilteredOnMap = () => {
    const map = mapRef.current;
    if (!map || filteredVendors.length === 0) return;
    setIsAutoFollowing(false);
    if (filteredVendors.length === 1) {
      const v = filteredVendors[0];
      map.flyTo([v.current_lat, v.current_lng], 17, { animate: true, duration: 0.6 });
      return;
    }
    const points = filteredVendors.map((v) => [v.current_lat, v.current_lng]);
    if (clientPos) points.push([clientPos.lat, clientPos.lng]);
    map.fitBounds(L.latLngBounds(points), { padding: [64, 64], maxZoom: 16 });
  };

  const distanceLabel = DISTANCE_OPTIONS.find((o) => o.value === maxDistance)?.label;

  useEffect(() => {
    if (!selected) { setVendorProducts([]); return; }
    axios.get(`${BASE_URL}/vendors/${selected.id}/products`)
      .then(res => setVendorProducts(res.data))
      .catch(e => console.error('Erro ao carregar produtos do vendedor:', e));
  }, [selected]);

  return (
    <div className="home">
      <div className={`modern-layout modern-layout--${viewMode}`}>
        <aside className="sidebar-left" aria-label="Filtros de pesquisa">
          <div className="search-panel">
            <header className="search-panel-head">
              <h2 className="search-panel-title">Procurar vendedores</h2>
              <p className="search-panel-count">
                {filteredVendors.length}{' '}
                {filteredVendors.length === 1
                  ? 'vendedor encontrado'
                  : 'vendedores encontrados'}
              </p>
            </header>

            {/* Distância: segmento único, como as abas de modo de um motor de
                pesquisa — cinco escolhas curtas cabem numa linha e evitam a
                lista de rádios, que ocupava meio painel. */}
            <div className="filter-block">
              <h3 className="filter-label">
                <FiMapPin size={13} aria-hidden="true" />
                Distância
              </h3>
              <div className="segmented" role="group" aria-label="Distância máxima">
                {DISTANCE_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    type="button"
                    className={`segmented-opt${maxDistance === opt.value ? ' active' : ''}`}
                    aria-pressed={maxDistance === opt.value}
                    onClick={() => setMaxDistance(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {maxDistance !== null && !clientPos && (
                <p className="filter-hint">Ativa a localização para filtrar por distância.</p>
              )}
            </div>

            <div className="filter-block">
              <h3 className="filter-label">Tipo de produto</h3>
              <div className="option-list">
                {PRODUCTS.map((p) => {
                  const active = selectedProducts.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      className={`option-card${active ? ' active' : ''}`}
                      aria-pressed={active}
                      onClick={() => toggleProduct(p)}
                    >
                      <span className="option-card-mark" aria-hidden="true">
                        {active && <FiCheck size={12} />}
                      </span>
                      <span className="option-card-label">{p}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {activeFilterCount > 0 && (
              <div className="filter-chips" aria-label="Filtros ativos">
                {selectedProducts.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="filter-chip"
                    onClick={() => toggleProduct(p)}
                    aria-label={`Remover filtro ${p}`}
                  >
                    {p}
                    <FiX size={13} aria-hidden="true" />
                  </button>
                ))}
                {maxDistance !== null && (
                  <button
                    type="button"
                    className="filter-chip"
                    onClick={() => setMaxDistance(null)}
                    aria-label="Remover filtro de distância"
                  >
                    Até {distanceLabel}
                    <FiX size={13} aria-hidden="true" />
                  </button>
                )}
              </div>
            )}

            <div className="search-panel-actions">
              <button
                type="button"
                className="panel-btn panel-btn-ghost"
                onClick={resetFilters}
                disabled={activeFilterCount === 0}
              >
                Limpar
              </button>
              <button
                type="button"
                className="panel-btn panel-btn-primary"
                onClick={showFilteredOnMap}
                disabled={filteredVendors.length === 0}
              >
                Ver no mapa
              </button>
            </div>
          </div>
        </aside>

        <div className="map-wrapper">
          <section className="map-area" aria-label="Mapa de vendedores">
            <h1 className="map-tagline">
              Encontra vendedores de praia perto de ti, em tempo real
            </h1>
            <MapContainer
              ref={mapRef}
              center={initialView.center}
              zoom={initialView.zoom}
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
              {clientPos && (
                <Marker
                  position={[clientPos.lat, clientPos.lng]}
                  icon={L.divIcon({
                    className: 'client-pin',
                    html: getClientPinHtml(heading),
                    iconSize: [54, 54],
                    iconAnchor: [27, 27],
                  })}
                >
                  <Popup>Você está aqui</Popup>
                </Marker>
              )}
              {filteredVendors.map((v) => {
                const pinColor = v.pin_color || '#1D5C3A';
                return (
                  <AnimatedVendorMarker
                    key={v.id}
                    position={[v.current_lat, v.current_lng]}
                    icon={L.divIcon({
                      className: 'vendor-pin',
                      html: getVendorPinHtml(pinColor),
                      iconSize: [40, 48],
                      iconAnchor: [20, 47],
                    })}
                    eventHandlers={{
                      click: () => focusVendor(v),
                    }}
                  />
                );
              })}

              <ClientAutoFollow
                clientPos={clientPos}
                isAutoFollowing={isAutoFollowing}
                setIsAutoFollowing={setIsAutoFollowing}
              />
              <VendorsFallbackView
                vendors={filteredVendors}
                clientPos={clientPos}
                enabled={!hadLastPos}
              />
              <LocateButton
                currentPos={clientPos}
                onLocationFound={(pos) => {
                  setClientPos(pos);
                  writeLastPos(pos.lat, pos.lng);
                  setIsAutoFollowing(true);
                }}
                onClick={requestCompassPermission}
              />
            </MapContainer>

            {/* Alternador de vista, ancorado ao canto do mapa. Em desktop
                abre/fecha a coluna de vendedores; em telemóvel é a única
                forma de chegar à lista, que de outro modo não existia. */}
            <div className="map-toolbar" role="group" aria-label="Modo de visualização">
              <button
                type="button"
                className={`map-toolbar-btn${viewMode === 'map' ? ' active' : ''}`}
                aria-pressed={viewMode === 'map'}
                onClick={() => setViewMode('map')}
              >
                <FiMap size={16} aria-hidden="true" />
                <span className="map-toolbar-label">Mapa</span>
              </button>
              <button
                type="button"
                className={`map-toolbar-btn${viewMode === 'list' ? ' active' : ''}`}
                aria-pressed={viewMode === 'list'}
                onClick={() => setViewMode('list')}
              >
                <FiList size={16} aria-hidden="true" />
                <span className="map-toolbar-label">Lista</span>
              </button>
            </div>

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

            {/* Faixa de estado do mapa. O estado vazio existia apenas dentro
                da .sidebar-right, que tem display:none abaixo de 768px — ou
                seja, num telemóvel o utilizador numa praia sem vendedores via
                um mapa vazio sem saber se era o resultado ou uma falha de
                carregamento. As duas faixas ocupam o mesmo espaço e têm a
                mesma forma; o que as distingue é o texto e o shimmer. */}
            {!tilesLoaded && (
              <p className="map-status map-status--loading" role="status">
                A procurar vendedores…
              </p>
            )}
            {tilesLoaded && filteredVendors.length === 0 && (
              <p className="map-status" role="status">
                Nenhum vendedor por perto agora.
              </p>
            )}

            {!isNarrow && (
              <div className="weather-overlay">
                <WeatherCard />
              </div>
            )}

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

            {showFilterSheet && (
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

        <aside className="sidebar-right" aria-label="Vendedores perto de ti">
          <div className="vendors-panel">
            <div className="vendors-header">
              <div className="vendors-header-text">
                <h3 className="vendors-title">Vendedores perto de ti</h3>
                {nearbyVendorsCount !== null && (
                  <span className="vendors-count">{nearbyVendorsCount} por perto</span>
                )}
              </div>
              <button
                type="button"
                className="vendors-close"
                onClick={() => setViewMode('map')}
                aria-label="Fechar lista de vendedores"
              >
                <FiX size={18} />
              </button>
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
        </aside>

      </div>
    </div>
  );
}
