import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { registerPlugin } from '@capacitor/core';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Mesmo plugin de rotação do mapa do site: o mapa da app roda com o gesto de
// dois dedos, como qualquer mapa de telemóvel.
import 'leaflet-rotate';
import { BASE_URL, TILE_LAYER, mediaUrl } from '../config.js';
import AnimatedMarker from '../components/AnimatedMarker.jsx';
import useDeviceHeading from '../hooks/useDeviceHeading.js';
import '../styles/MapTab.css';

const LocationTracker = registerPlugin('LocationTracker');

// (em português) Cor por omissão do pin — a mesma que o site usa para os
// vendedores sem cor escolhida, para o vendedor se ver no mapa da app tal
// como os banhistas o veem no mapa do site.
const DEFAULT_PIN = '#1D5C3A';

// (em português) Última posição conhecida do vendedor, guardada entre
// arranques. O mapa abre nela — a praia onde esteve ontem — em vez de esperar
// pelo primeiro fix de GPS, que ao sol e em 4G congestionada pode demorar
// vários segundos. Sem nada guardado abre em Lisboa, como o mapa do site.
const LAST_POS_KEY = 'last_vendor_pos';
const FALLBACK_CENTER = [38.7169, -9.1399];

function readLastPos() {
  try {
    const raw = localStorage.getItem(LAST_POS_KEY);
    if (!raw) return null;
    const { lat, lng } = JSON.parse(raw);
    if (typeof lat !== 'number' || typeof lng !== 'number') return null;
    return [lat, lng];
  } catch {
    return null;
  }
}

function writeLastPos(lat, lng) {
  try {
    localStorage.setItem(LAST_POS_KEY, JSON.stringify({ lat, lng }));
  } catch {
    /* localStorage indisponível: abrir em Lisboa não é crítico */
  }
}

function hexToRgba(hex, alpha) {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
  if (!match) return `rgba(29, 92, 58, ${alpha})`;
  const [r, g, b] = match.slice(1).map((h) => parseInt(h, 16));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function escapeHtml(str) {
  return String(str ?? '').replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

// (em português) Distância entre duas coordenadas, em metros. É o que
// alimenta a métrica "Distância" enquanto o vendedor está a partilhar.
function metersBetween([lat1, lng1], [lat2, lng2]) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

function formatElapsed(totalSeconds) {
  const secs = Math.max(0, Math.floor(totalSeconds));
  const pad = (n) => String(n).padStart(2, '0');
  const hours = Math.floor(secs / 3600);
  const minutes = Math.floor((secs % 3600) / 60);
  if (hours > 0) return `${hours}:${pad(minutes)}:${pad(secs % 60)}`;
  return `${pad(minutes)}:${pad(secs % 60)}`;
}

function formatKm(meters) {
  return `${(meters / 1000).toFixed(1).replace('.', ',')} km`;
}

// O pin do vendedor é o mesmo marcador que o site desenha para a posição do
// dispositivo: círculo na cor escolhida no perfil, anel branco e seta de
// direção lá dentro. O halo só pulsa enquanto a partilha está ligada.
// A seta aponta para o rumo geográfico; como o marcador vive no painel que não
// roda com o mapa, é o CSS que lhe soma o bearing atual (`--map-bearing`).
// Com Premium leva ainda a estrela ao canto — a mesma que o banhista vê no
// mapa do site, para o vendedor confirmar aqui que a vantagem está a pegar.
function getVendorLocationHtml(heading, color, sharing, premium) {
  const hasHeading = heading !== null && !isNaN(heading);
  const arrow = hasHeading
    ? `<svg viewBox="0 0 20 20" width="12" height="12" class="user-location-arrow" style="--pin-heading:${heading.toFixed(1)}deg;"><polygon points="10,1 6.5,14 10,11.5 13.5,14" fill="#fff"/></svg>`
    : '';
  const pinColor = color || DEFAULT_PIN;
  const safeColor = escapeHtml(pinColor);
  const pulse = sharing
    ? `<div class="user-location-pulse" style="background:${hexToRgba(pinColor, 0.2)};"></div>`
    : '';
  const star = premium
    ? '<span class="pin-premium-star" aria-hidden="true"><svg viewBox="0 0 24 24" width="10" height="10"><polygon points="12 2 15.09 9.26 23 9.27 16.5 14.14 19 21.5 12 17 5 21.5 7.5 14.14 1 9.27 8.91 9.26" fill="currentColor"/></svg></span>'
    : '';
  return `<div class="user-location-marker">${pulse}<div class="user-location-dot" style="background:${safeColor};box-shadow:0 2px 8px ${hexToRgba(pinColor, 0.45)};">${arrow}</div>${star}</div>`;
}

function FollowPosition({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.setView(position, map.getZoom() < 15 ? 16 : map.getZoom());
  }, [position, map]);
  return null;
}

// Diferença entre dois rumos, sempre entre 0 e 180 graus.
function bearingGap(a, b) {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

// Publica o rumo do mapa em CSS (`--map-bearing`) e avisa o ecrã quando ele
// está torto. A seta do pin vive num painel que não roda com o mapa, por isso
// é o CSS que lhe soma este valor; escrevê-lo aqui, e não em estado, evita
// redesenhar o marcador a cada grau do gesto.
function MapBearingPublisher({ onRotatedChange }) {
  const map = useMap();
  useEffect(() => {
    // No ecrã inteiro e não só no mapa: a variável tem de chegar tanto à seta
    // do pin (dentro do mapa) como à agulha do botão do norte (no chrome, que
    // é irmão do mapa).
    const container = map.getContainer().closest('.map-screen') || map.getContainer();
    const publish = () => {
      const bearing = map.getBearing();
      container.style.setProperty('--map-bearing', `${bearing.toFixed(1)}deg`);
      onRotatedChange(bearingGap(bearing, 0) > 1);
    };
    publish();
    map.on('rotate', publish);
    return () => map.off('rotate', publish);
  }, [map, onRotatedChange]);
  return null;
}

// (em português) O Leaflet mede a caixa do mapa uma vez e só volta a medir no
// `resize` da JANELA — que aqui nunca chega. A caixa, essa, muda: os painéis
// dos separadores são irmãos escondidos com `hidden` (display:none), por isso
// o mapa montado enquanto o vendedor espreita outro separador nasce com 0×0 e
// fica-se por um tile; o teclado do Android e a rotação do ecrã mexem-lhe da
// mesma maneira. Volta a medir-se sempre que a caixa muda, como no site.
function MapResizeWatcher() {
  const map = useMap();
  useEffect(() => {
    if (typeof ResizeObserver === 'undefined') return undefined;
    const container = map.getContainer();
    let frame = null;
    const observer = new ResizeObserver(() => {
      // Fora do ciclo do observador: `invalidateSize` volta a ler a caixa e o
      // navegador avisaria de um ciclo de observação por entregar.
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // Painel escondido: não há caixa que se meça, e medir zero só faria o
        // mapa perder a vista. A medida certa vem quando ele voltar à frente.
        if (!container.offsetWidth || !container.offsetHeight) return;
        map.invalidateSize({ animate: false });
      });
    });
    observer.observe(container);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, [map]);
  return null;
}

// Roda o mapa até um rumo alvo (graus), pelo caminho mais curto e com a
// mesma suavidade do resto do ecrã. `to = 0` endireita para norte.
function animateToBearing(map, to) {
  if (!map) return;
  const from = map.getBearing();
  // Caminho mais curto: normaliza a diferença para o intervalo [-180, 180].
  const delta = ((to - from + 540) % 360) - 180;
  const start = performance.now();
  const DURATION = 320;
  const step = (now) => {
    const t = Math.min(1, (now - start) / DURATION);
    map.setBearing(from + delta * (1 - (1 - t) ** 3));
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

// Em browser o Capacitor não implementa `requestPermissions`; nesse caso é o
// próprio pedido de posição que trata da permissão.
async function ensureLocationPermission() {
  try {
    const perm = await Geolocation.requestPermissions();
    return perm.location === 'granted' || perm.location === 'prompt';
  } catch {
    return true;
  }
}

export default function MapTab({ auth, onChangePage, onLogout, onUserUpdate, registerStopSharing }) {
  const { token, user, vendorId } = auth;
  const [sharing, setSharing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState(null);
  const [mapError, setMapError] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [distanceM, setDistanceM] = useState(0);
  const [tilesLoaded, setTilesLoaded] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  const mapRef = useRef(null);
  // Lido uma única vez: o Leaflet só olha para `center` quando cria o mapa, e
  // este ecrã volta a desenhar-se a cada leitura de GPS.
  const [initialCenter] = useState(() => readLastPos() || FALLBACK_CENTER);
  const listenerRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastTrackedRef = useRef(null);
  const sharingRef = useRef(false);
  const { heading, reportGpsHeading, enableCompass } = useDeviceHeading();
  const pinColor = user?.pin_color || DEFAULT_PIN;
  const isPremium = Boolean(user?.is_premium);
  const vendorIcon = useMemo(() => L.divIcon({
    className: 'vendor-location-pin',
    html: getVendorLocationHtml(heading, pinColor, sharing, isPremium),
    iconSize: [54, 54],
    iconAnchor: [27, 27],
  }), [heading, pinColor, sharing, isPremium]);

  const authHeader = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    let active = true;
    const startWatch = async () => {
      try {
        if (!(await ensureLocationPermission())) {
          if (active) setMapError('Permissão de localização negada. Ativa nas definições do telemóvel.');
          return;
        }
        watchIdRef.current = await Geolocation.watchPosition(
          { enableHighAccuracy: true },
          (pos, err) => {
            if (!active) return;
            if (err) {
              setMapError('Não foi possível obter a localização.');
              return;
            }
            if (pos) {
              setMapError(null);
              // Só atualiza o mapa local e o rumo. O envio para o servidor é do
              // serviço nativo, que continua a correr com a app em segundo plano.
              applyPosition(pos.coords.latitude, pos.coords.longitude, false);
              reportGpsHeading(pos.coords.heading, pos.coords.speed);
            }
          }
        );
      } catch {
        if (active) setMapError('Não foi possível obter a localização.');
      }
    };
    startWatch();
    return () => {
      active = false;
      if (watchIdRef.current != null) Geolocation.clearWatch({ id: watchIdRef.current });
    };
  }, []);

  // Guardada para o arranque seguinte abrir já na praia do vendedor.
  useEffect(() => {
    if (position) writeLastPos(position[0], position[1]);
  }, [position]);

  // Como no site: numa 4G de praia congestionada é melhor mostrar o mapa
  // meio carregado do que segurar a grelha cinzenta à espera do evento
  // `load` dos tiles, que pode nunca chegar.
  useEffect(() => {
    if (tilesLoaded) return undefined;
    const t = setTimeout(() => setTilesLoaded(true), 2500);
    return () => clearTimeout(t);
  }, [tilesLoaded]);

  // O tempo decorrido vem do instante em que a sessão começou, não de um
  // contador local: assim sobrevive a app ir para segundo plano.
  useEffect(() => {
    if (!sharing || !startedAt) return undefined;
    const tick = () => setElapsed((Date.now() - startedAt) / 1000);
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [sharing, startedAt]);

  const readApiError = async (response, fallbackMessage) => {
    try {
      const payload = await response.json();
      return payload.detail || fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  // (em português) Atualiza o mapa local e, quando `trackDistance`, a métrica de
  // distância desta sessão. Não envia nada para o servidor: o envio é feito pelo
  // serviço nativo, que sobrevive à app ir para segundo plano ou ao ecrã
  // bloquear — que é precisamente quando a WebView (e este JS) fica congelada.
  const applyPosition = useCallback((lat, lng, trackDistance) => {
    setPosition([lat, lng]);
    if (trackDistance && sharingRef.current) {
      const previous = lastTrackedRef.current;
      if (previous) {
        const step = metersBetween(previous, [lat, lng]);
        if (step > 1) setDistanceM((total) => total + step);
      }
      lastTrackedRef.current = [lat, lng];
    }
  }, []);

  // (em português) Envio único e imediato ao iniciar a partilha, para o vendedor
  // aparecer logo no mapa do banhista sem esperar pelo primeiro fix do serviço
  // nativo. A partir daí, todos os envios são do serviço nativo.
  const sendInitialLocation = useCallback(async (lat, lng) => {
    const response = await fetch(`${BASE_URL}/vendors/${vendorId}/location`, {
      method: 'PUT',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ lat, lng }),
    });
    if (!response.ok) {
      const message = await readApiError(response, 'Erro ao enviar localização');
      throw new Error(message);
    }
  }, [vendorId, token]);

  const startSharing = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!(await ensureLocationPermission())) {
        setError('Permissão de localização negada.');
        setLoading(false);
        return;
      }

      const res = await fetch(`${BASE_URL}/vendors/${vendorId}/routes/start`, {
        method: 'POST',
        headers: authHeader,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Erro ao iniciar partilha');
      }
      const route = await res.json().catch(() => null);
      const startTime = route?.start_time ? new Date(route.start_time).getTime() : Date.now();

      const currentPosition = position || await Geolocation.getCurrentPosition({ enableHighAccuracy: true });
      const currentLat = Array.isArray(currentPosition)
        ? currentPosition[0]
        : currentPosition.coords.latitude;
      const currentLng = Array.isArray(currentPosition)
        ? currentPosition[1]
        : currentPosition.coords.longitude;

      lastTrackedRef.current = null;
      setDistanceM(0);
      setStartedAt(Number.isNaN(startTime) ? Date.now() : startTime);
      setElapsed(0);
      // A trava de distância só conta quando `sharing` está ligado; ligá-la já
      // aqui evita perder os primeiros metros entre este ponto e o `setSharing`.
      sharingRef.current = true;

      applyPosition(currentLat, currentLng, true);
      await sendInitialLocation(currentLat, currentLng);

      // O serviço nativo envia sozinho as posições seguintes. Este ouvinte só
      // atualiza o mapa local e a distância enquanto a app está à frente.
      listenerRef.current = await LocationTracker.addListener(
        'locationUpdate',
        ({ lat, lng }) => applyPosition(lat, lng, true)
      );
      await LocationTracker.startTracking({
        baseUrl: BASE_URL,
        vendorId: String(vendorId),
        token,
      });
      setSharing(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const stopSharing = async () => {
    setLoading(true);
    setError(null);
    try {
      if (listenerRef.current) {
        await listenerRef.current.remove();
        listenerRef.current = null;
      }
      await LocationTracker.stopTracking();
    } catch (err) {
      console.error('Erro ao parar tracking nativo:', err);
    }
    try {
      await fetch(`${BASE_URL}/vendors/${vendorId}/routes/stop`, {
        method: 'POST',
        headers: authHeader,
      });
    } catch (err) {
      console.error('Erro ao parar partilha:', err);
    } finally {
      setSharing(false);
      setStartedAt(null);
      setElapsed(0);
      setDistanceM(0);
      lastTrackedRef.current = null;
      setLoading(false);
    }
  };

  // A app deixou de ter o botão de sair no mapa (passou para a Conta), por
  // isso é o App que precisa de conseguir parar a partilha antes de limpar
  // a sessão.
  const stopSharingRef = useRef(stopSharing);
  sharingRef.current = sharing;
  stopSharingRef.current = stopSharing;

  useEffect(() => {
    if (!registerStopSharing) return undefined;
    registerStopSharing(async () => {
      if (sharingRef.current) await stopSharingRef.current();
    });
    return () => registerStopSharing(null);
  }, [registerStopSharing]);

  useEffect(() => {
    return () => {
      if (listenerRef.current) listenerRef.current.remove();
    };
  }, []);

  // (em português) Botão de localização, como o do site: leva o mapa à
  // posição do vendedor e, quando há bússola, ALINHA o mapa com o seu rumo
  // (a direção para onde está virado fica a apontar para cima — modo
  // navegação). Ativa a bússola no toque, que no iOS é o único momento em
  // que a permissão pode ser pedida. Sem posição ainda, só ativa a bússola.
  const handleLocate = async () => {
    await enableCompass();
    const map = mapRef.current;
    if (!map) return;
    if (position) {
      const zoom = map.getZoom() < 16 ? 17 : map.getZoom();
      map.setView(position, zoom, { animate: true });
    }
    // Alinhar com o rumo: o mapa roda para -rumo, o que põe a direção do
    // vendedor para cima e (com a soma --pin-heading + --map-bearing) deixa a
    // seta do pin a apontar para cima. Sem rumo, endireita para norte.
    const hasHeading = heading !== null && !isNaN(heading);
    animateToBearing(map, hasHeading ? (360 - heading) % 360 : 0);
  };

  const vendorName = user?.name || 'Vendedor';
  const initial = vendorName.charAt(0).toUpperCase();
  const photo = user?.profile_photo ? mediaUrl(user.profile_photo) : null;

  const status = sharing
    ? { label: 'A partilhar', className: 'is-sharing' }
    : { label: 'Offline', className: 'is-idle' };

  return (
    <div className="map-screen">
      {/* O mapa ocupa todo o fundo; o resto é sobreposto. */}
      <div className="map-canvas">
        {/* O mapa é desenhado de imediato, na última posição conhecida: à
            espera do primeiro fix de GPS ficava uma grelha cinzenta, e o mapa
            criado mais tarde podia nascer num painel escondido — sem caixa que
            medir e, por isso, sem tiles. O pin é que espera pela posição real.
            `rotate` + `touchRotate`: o mesmo gesto de dois dedos faz zoom e
            roda o mapa, como no site e como em qualquer mapa de telemóvel. O
            controlo de rotação do plugin fica desligado — quem endireita o
            mapa é o botão do norte, desenhado como o resto do ecrã. */}
        <MapContainer
          ref={mapRef}
          center={initialCenter}
          zoom={16}
          className="map-container"
          zoomControl={false}
          rotate={true}
          bearing={0}
          touchRotate={true}
          rotateControl={false}
        >
          <TileLayer
            {...TILE_LAYER}
            eventHandlers={{ load: () => setTilesLoaded(true) }}
          />
          {position && <AnimatedMarker position={position} icon={vendorIcon} />}
          <FollowPosition position={position} />
          <MapBearingPublisher onRotatedChange={setIsRotated} />
          <MapResizeWatcher />
        </MapContainer>
        {/* Grelha com brilho a atravessar, como no mapa do site, enquanto
            os tiles ainda não pintaram. */}
        <div
          className={`map-skeleton${tilesLoaded ? ' map-skeleton--hidden' : ''}`}
          aria-hidden="true"
        />
      </div>

      <div className="map-chrome">
        <div className="map-topbar">
          <button
            type="button"
            className="map-user-pill"
            onClick={() => onChangePage('account')}
            title="Ir para a conta"
          >
            {photo ? (
              <img src={photo} alt="" className="map-user-avatar" />
            ) : (
              <span className="map-user-avatar map-user-avatar-initial">{initial}</span>
            )}
            <span className="map-user-name">{vendorName}</span>
          </button>

          <div className={`map-status-pill ${status.className}`}>
            <span className="map-status-dot" />
            <span className="map-status-label">{status.label}</span>
          </div>
        </div>

        <div className="map-bottom">
          {/* Controlos flutuantes à direita, empilhados sobre o cartão de
              partilha — o canto do polegar de quem segura o telemóvel. */}
          <div className="map-side-controls">
            {/* Botão do norte: só aparece com o mapa torto, isto é, depois de o
                vendedor o ter rodado com os dois dedos. A agulha roda com o
                mapa, por isso aponta sempre para o norte real. */}
            {isRotated && (
              <button
                type="button"
                className="map-north-btn"
                onClick={() => animateToBearing(mapRef.current, 0)}
                aria-label="Virar o mapa para norte"
              >
                <svg className="map-north-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
                  <polygon points="12,3 8.2,15 12,12.4 15.8,15" fill="var(--site-coral)" />
                  <polygon points="12,21 8.2,15 12,17.6 15.8,15" fill="#9aa5b1" />
                </svg>
              </button>
            )}

            {/* Botão de localização: leva o mapa à posição do vendedor e alinha
                com o seu rumo. Igual em forma ao botão "localizar-me" do site. */}
            <button
              type="button"
              className="map-locate-btn"
              onClick={handleLocate}
              disabled={!position}
              aria-label="Ir para a minha localização e alinhar"
            >
              <svg className="map-locate-icon" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" aria-hidden="true">
                <circle cx="12" cy="12" r="4" strokeWidth="2" />
                <circle cx="12" cy="12" r="8.5" strokeWidth="1.6" />
                <line x1="12" y1="1" x2="12" y2="4" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="12" y1="20" x2="12" y2="23" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="1" y1="12" x2="4" y2="12" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="20" y1="12" x2="23" y2="12" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          {/* GPS ainda por obter: a mesma faixa de estado do site — texto
              branco sobre petróleo, legível num ecrã ao sol. */}
          {!position && !mapError && (
            <p className="map-status" role="status">
              A obter a tua localização…
            </p>
          )}

          {mapError && (
            <div className="map-alert">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <span>{mapError}</span>
            </div>
          )}

          {error && (
            <div className="map-alert">
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="share-card">
            {sharing && (
              <div className="share-metrics">
                <div className="share-metric">
                  <span className="share-metric-label">Tempo</span>
                  <span className="share-metric-value">{formatElapsed(elapsed)}</span>
                </div>
                <div className="share-metric">
                  <span className="share-metric-label">Distância</span>
                  <span className="share-metric-value">{formatKm(distanceM)}</span>
                </div>
              </div>
            )}

            <button
              type="button"
              className={`share-btn${sharing ? ' is-sharing' : ''}`}
              onClick={sharing ? stopSharing : startSharing}
              disabled={loading}
            >
              <span className="share-btn-dot" />
              {loading
                ? (sharing ? 'A parar…' : 'A ligar…')
                : (sharing ? 'Parar partilha' : 'Iniciar partilha')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
