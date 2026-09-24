import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { Capacitor, registerPlugin } from '@capacitor/core';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Mesmo plugin de rotação do mapa do site: o mapa da app roda com o gesto de
// dois dedos, como qualquer mapa de telemóvel.
import 'leaflet-rotate';
import { BASE_URL, TILE_LAYER } from '../config.js';
import AnimatedMarker from '../components/AnimatedMarker.jsx';
import BrandHeader from '../components/BrandHeader.jsx';
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

// Enquanto o watch do JS estiver a entregar leituras (app à frente), as do
// serviço nativo não mexem no mapa. Três segundos é o intervalo do serviço;
// sete dá folga para uma leitura falhada antes de ele assumir o comando.
const NATIVE_TAKEOVER_MS = 7000;
// Abaixo disto é tremer do GPS, não andamento do vendedor.
const MIN_MOVE_METERS = 1;
// (em português) Precisão (raio de erro, m) a partir da qual uma leitura já é
// "boa". Uma leitura bem pior do que isto — um palpite da rede móvel, com
// centenas de metros de erro — não substitui uma boa recente: era isso que
// punha o pin aos saltos para um quarteirão ao lado e de volta.
const GOOD_ACCURACY_METERS = 50;
// Durante quanto tempo uma leitura boa protege o pin das más que vierem a seguir.
const GOOD_FIX_HOLD_MS = 15000;
// Ao iniciar a partilha, quanto tempo se espera por um fix preciso antes de
// enviar o melhor que houver.
const INITIAL_FIX_TIMEOUT_MS = 8000;
// (em português) No Android o plugin usa o `timeout` como intervalo do watch e
// traz um intervalo mínimo de 5 s por omissão: o pin recebia uma posição a cada
// 5–10 s (e o rumo do GPS, em andamento, também), enquanto o browser do site
// entrega uma por segundo. No browser o `timeout` é mesmo um prazo, e 1 s daria
// erros de tempo esgotado — por isso só se aplica no nativo.
const WATCH_INTERVAL_MS = 1000;
const WATCH_OPTIONS = Capacitor.isNativePlatform()
  ? { enableHighAccuracy: true, maximumAge: 0, timeout: WATCH_INTERVAL_MS, minimumUpdateInterval: WATCH_INTERVAL_MS }
  : { enableHighAccuracy: true, maximumAge: 0 };

// Distância entre duas coordenadas, em metros (equirretangular: a menos de um
// metro em distâncias de praia, e sem a trigonometria toda do haversine).
function metersBetween(lat1, lng1, lat2, lng2) {
  const R = 6371000;
  const rad = Math.PI / 180;
  const x = (lng2 - lng1) * rad * Math.cos(((lat1 + lat2) / 2) * rad);
  const y = (lat2 - lat1) * rad;
  return Math.sqrt(x * x + y * y) * R;
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

// O pin do vendedor é o mesmo marcador que o site desenha para a posição do
// dispositivo: círculo na cor escolhida no perfil, anel branco e seta de
// direção lá dentro. O halo só pulsa enquanto a partilha está ligada.
// A seta aponta para o rumo geográfico; como o marcador vive no painel que não
// roda com o mapa, o ângulo no ecrã já lhe chega somado ao bearing do mapa, na
// variável CSS `--pin-heading` que o MapRotationController escreve a cada
// fotograma. O rumo NÃO entra neste HTML: refazê-lo a cada leitura da bússola
// obrigava o Leaflet
// a trocar o elemento no DOM dez vezes por segundo — o halo reiniciava e o pin
// tremia, que é a falta de fluidez que se sente na app.
// Com Premium leva ainda a estrela ao canto — a mesma que o banhista vê no
// mapa do site, para o vendedor confirmar aqui que a vantagem está a pegar.
function getVendorLocationHtml(color, sharing, premium) {
  const arrow = '<svg viewBox="0 0 20 20" width="12" height="12" class="user-location-arrow"><polygon points="10,1 6.5,14 10,11.5 13.5,14" fill="#fff"/></svg>';
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

// (em português) O mapa segue o vendedor. Seguir com `setView` a cada leitura
// — como se fazia aqui — dava dois problemas de uma vez: o mapa saltava de
// golpe a cada fix e arrastá-lo com o dedo era inútil, porque a leitura
// seguinte trazia-o logo de volta. Agora acompanha com uma deslocação suave,
// só quando o pin se afasta mesmo do centro, e larga o volante assim que o
// vendedor toca no mapa — o botão de localização devolve-lho.
const FOLLOW_DEADZONE_PX = 28;

function AutoFollow({ position, following, onUserPan }) {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const onInteraction = (e) => {
      if (e.target.closest('button, a, .leaflet-control')) return;
      onUserPan();
    };
    container.addEventListener('mousedown', onInteraction);
    container.addEventListener('touchstart', onInteraction, { passive: true });
    return () => {
      container.removeEventListener('mousedown', onInteraction);
      container.removeEventListener('touchstart', onInteraction);
    };
  }, [map, onUserPan]);

  useEffect(() => {
    if (!following || !position) return;
    const zoom = map.getZoom() < 15 ? 16 : map.getZoom();
    if (map.getZoom() !== zoom) {
      map.setView(position, zoom, { animate: false });
      return;
    }
    const target = map.latLngToContainerPoint(position);
    const center = map.latLngToContainerPoint(map.getCenter());
    const drift = target.distanceTo(center);
    // Tremer do GPS: mexer o mapa por dois píxeis só faz o mundo vibrar.
    if (drift < FOLLOW_DEADZONE_PX) return;
    const size = map.getSize();
    if (drift > Math.max(size.x, size.y)) {
      // Fora do ecrã (primeiro fix, ou volta de um longo intervalo): animar
      // meio país é pior do que aparecer já lá.
      map.setView(position, zoom, { animate: false });
      return;
    }
    // Deslocação linear e da duração do intervalo típico entre leituras: o
    // mapa desliza com o pin em vez de o perseguir aos solavancos.
    map.panTo(position, { animate: true, duration: 0.7, easeLinearity: 0.5, noMoveStart: true });
  }, [position, following, map]);

  return null;
}

// Um ângulo em graus trazido para o intervalo [0, 360). O `getBearing` do
// plugin devolve o que lhe puseram lá — um gesto longo pode deixá-lo negativo
// ou acima de 360 — e o resto de `%` em JS herda o sinal do dividendo.
function normalizeDeg(deg) {
  return ((deg % 360) + 360) % 360;
}

// Diferença entre dois rumos, sempre entre 0 e 180 graus.
function bearingGap(a, b) {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

// Quanto é preciso rodar com os dedos para o gesto valer como "o mapa é meu".
const MANUAL_ROTATE_DEG = 4;

// Zoom a que o botão de localização deixa o mapa — o mesmo que o botão do site
// usa para o banhista, para o vendedor se ver ao nível da rua.
const LOCATE_ZOOM = 18;

// Dono da rotação do mapa, tal como no site. Há dois candidatos ao volante: a
// bússola do dispositivo, que mantém o mapa virado para onde o vendedor olha,
// e os dois dedos dele. Quem toca manda — assim que o gesto roda mesmo o mapa,
// a bússola larga o volante até ao botão do norte ou ao de localizar.
// Publica também o rumo do mapa em CSS (`--map-bearing`): a seta do pin vive
// num painel que não roda com o mapa, por isso é o CSS que lhe soma este
// valor; escrevê-lo aqui, e não em estado, evita redesenhar o marcador a cada
// grau do gesto.
function MapRotationController({ headingRef, targetBearingRef, hasHeading, followCompass, onManualRotate, onRotatedChange }) {
  const map = useMap();
  // Rumo no início do gesto de dois dedos; `null` quando não há gesto a
  // decorrer — é também o sinal de "não mexer no mapa" para a bússola.
  const gestureBearingRef = useRef(null);
  // Rumo suavizado que a bússola está a aplicar; `null` = ainda não arrancou.
  const smoothBearingRef = useRef(null);
  // Rumo do dispositivo, suavizado com a MESMA constante do bearing do mapa —
  // é essa igualdade que mantém a seta a apontar em frente durante a viragem
  // (ver o comentário do ciclo de fotogramas).
  const smoothHeadingRef = useRef(null);
  // Último ângulo escrito na seta, para não tocar no estilo sem necessidade.
  const lastArrowRef = useRef(null);

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

  // Gesto de dois dedos: enquanto dura, o mapa é do vendedor; se chegar a
  // rodá-lo mais do que um tremer de mão, a bússola larga-o de vez.
  useEffect(() => {
    const container = map.getContainer();

    const onTouchStart = (e) => {
      if (e.touches.length === 2) gestureBearingRef.current = map.getBearing();
    };
    const onTouchEnd = (e) => {
      if (e.touches.length < 2) gestureBearingRef.current = null;
    };
    const onRotate = () => {
      const start = gestureBearingRef.current;
      if (start !== null && bearingGap(map.getBearing(), start) > MANUAL_ROTATE_DEG) {
        onManualRotate();
      }
    };

    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchend', onTouchEnd, { passive: true });
    container.addEventListener('touchcancel', onTouchEnd, { passive: true });
    map.on('rotate', onRotate);
    return () => {
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchend', onTouchEnd);
      container.removeEventListener('touchcancel', onTouchEnd);
      map.off('rotate', onRotate);
    };
  }, [map, onManualRotate]);

  // Um único ciclo de fotogramas trata das duas metades do modo navegação: o
  // mapa a rodar para o rumo e a seta do pin a apontar em frente. Estavam
  // separados — o mapa rodava aqui a cada fotograma, a seta era desenhada pelo
  // React dez vezes por segundo e ainda passava por uma transição CSS — e o
  // desencontro entre os dois ritmos era exatamente o que punha a seta a
  // apontar ligeiramente ao lado enquanto o vendedor se virava.
  //
  // Agora ambos saem do mesmo fotograma e o rumo é suavizado com a MESMA
  // constante do bearing do mapa. Com os dois a perseguirem alvos simétricos
  // (rumo e 360 − rumo) à mesma cadência, os atrasos anulam-se: a soma do rumo
  // suavizado com o bearing real do mapa — que é o ângulo da seta no ecrã —
  // fica em zero durante toda a viragem, e não só no fim dela.
  useEffect(() => {
    if (!followCompass && !hasHeading) return undefined;
    let rafId;
    const LERP = 0.18;
    const container = map.getContainer().closest('.map-screen') || map.getContainer();

    const tick = () => {
      // 1. Rumo do dispositivo, suavizado pelo caminho mais curto.
      const rawHeading = headingRef.current;
      if (rawHeading !== null && rawHeading !== undefined && !isNaN(rawHeading)) {
        if (smoothHeadingRef.current === null) {
          smoothHeadingRef.current = rawHeading;
        } else {
          let diff = rawHeading - smoothHeadingRef.current;
          if (diff > 180) diff -= 360;
          if (diff < -180) diff += 360;
          smoothHeadingRef.current = (smoothHeadingRef.current + diff * LERP + 360) % 360;
        }
      }

      // 2. Bearing do mapa: persegue o rumo por passos de 18% da diferença. É
      // esta perseguição contínua que faz o mapa parecer colado ao telemóvel.
      if (followCompass) {
        const target = targetBearingRef.current;
        // Se o mapa foi rodado por fora — pelos dedos, pelo botão do norte — a
        // bússola retoma a partir de onde ele está e não de onde o deixou, que
        // é o que evita o salto ao reatar.
        if (
          smoothBearingRef.current !== null
          && bearingGap(map.getBearing(), smoothBearingRef.current) > 0.5
        ) {
          smoothBearingRef.current = map.getBearing();
        }
        // Dedos no mapa: a bússola cala-se até os levantarem.
        if (gestureBearingRef.current === null && target !== null && !isNaN(target)) {
          if (smoothBearingRef.current === null) {
            smoothBearingRef.current = target;
            map.setBearing(target);
          } else {
            let diff = target - smoothBearingRef.current;
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;
            if (Math.abs(diff) > 0.08) {
              smoothBearingRef.current = (smoothBearingRef.current + diff * LERP + 360) % 360;
              map.setBearing(smoothBearingRef.current);
            }
          }
        }
      }

      // 3. Ângulo da seta no ecrã. O marcador vive num painel que não roda com
      // o mapa, por isso o ângulo é o rumo mais o bearing que o mapa tem
      // MESMO neste fotograma — lido depois de o rodar, e não o alvo a que
      // ainda vai a caminho.
      if (smoothHeadingRef.current !== null) {
        const arrow = normalizeDeg(smoothHeadingRef.current + map.getBearing());
        if (lastArrowRef.current === null || bearingGap(arrow, lastArrowRef.current) > 0.15) {
          lastArrowRef.current = arrow;
          container.style.setProperty('--pin-heading', `${arrow.toFixed(1)}deg`);
        }
      }

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [map, headingRef, targetBearingRef, hasHeading, followCompass]);

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
  // Aviso (não é erro) de que a partilha se desligou sozinha por inatividade.
  const [notice, setNotice] = useState(null);
  const [tilesLoaded, setTilesLoaded] = useState(false);
  const [isRotated, setIsRotated] = useState(false);
  // O mapa segue o vendedor e roda com a bússola até ele tomar o volante: um
  // arrasto larga o seguimento, um gesto de rotação larga a bússola. O botão
  // de localização devolve-lhe as duas coisas.
  const [isAutoFollowing, setIsAutoFollowing] = useState(true);
  const [followCompass, setFollowCompass] = useState(true);
  const mapRef = useRef(null);
  // Lido uma única vez: o Leaflet só olha para `center` quando cria o mapa, e
  // este ecrã volta a desenhar-se a cada leitura de GPS.
  const [initialCenter] = useState(() => readLastPos() || FALLBACK_CENTER);
  const listenerRef = useRef(null);
  const stoppedListenerRef = useRef(null);
  const watchIdRef = useRef(null);
  const sharingRef = useRef(false);
  const { headingRef, targetBearingRef, hasHeading, reportGpsHeading, enableCompass } = useDeviceHeading();
  const pinColor = user?.pin_color || DEFAULT_PIN;
  const isPremium = Boolean(user?.is_premium);
  // Sem o rumo nas dependências: ele muda dez vezes por segundo e refazer o
  // ícone tantas vezes era o que tornava o pin tremido. Aqui o ícone só muda
  // quando muda mesmo — cor, partilha ligada, Premium.
  const vendorIcon = useMemo(() => L.divIcon({
    className: 'vendor-location-pin',
    html: getVendorLocationHtml(pinColor, sharing, isPremium),
    iconSize: [54, 54],
    iconAnchor: [27, 27],
  }), [pinColor, sharing, isPremium]);

  const stopFollowingCompass = useCallback(() => setFollowCompass(false), []);
  const stopAutoFollowing = useCallback(() => setIsAutoFollowing(false), []);

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
          // `maximumAge: 0` como no site: uma posição guardada em cache é
          // uma posição velha, e no mapa vê-se como um pin que anda atrasado
          // em relação ao vendedor.
          WATCH_OPTIONS,
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
              applyPosition(pos.coords.latitude, pos.coords.longitude, 'gps', pos.coords.accuracy);
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

  const readApiError = async (response, fallbackMessage) => {
    try {
      const payload = await response.json();
      return payload.detail || fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  // (em português) Atualiza o mapa local com a posição recebida. Não envia nada
  // para o servidor: o envio é feito pelo serviço nativo, que sobrevive à app ir
  // para segundo plano ou ao ecrã bloquear — que é precisamente quando a WebView
  // (e este JS) fica congelada.
  //
  // Com a partilha ligada há duas fontes de posição: o watch do JS, contínuo e
  // fino, e o serviço nativo, que só entrega de cinco em cinco segundos e
  // depois de filtrar os metros. Deixá-las escrever as duas punha o pin a
  // andar para a frente com uma e a recuar com a outra — o andamento errático
  // que se sente na app. À frente manda o watch do JS; o nativo só entra
  // quando o JS está calado (ecrã bloqueado, app a voltar do segundo plano).
  const lastGpsTsRef = useRef(0);
  const lastAppliedRef = useRef(null);
  // Raio de erro da posição no pin e quando chegou a última leitura boa.
  const lastAccuracyRef = useRef(null);
  const lastGoodFixTsRef = useRef(0);
  const applyPosition = useCallback((lat, lng, source = 'gps', accuracy = null) => {
    const now = Date.now();
    if (source === 'gps') {
      lastGpsTsRef.current = now;
    } else if (now - lastGpsTsRef.current < NATIVE_TAKEOVER_MS) {
      return;
    }
    const hasAccuracy = typeof accuracy === 'number' && Number.isFinite(accuracy);
    if (hasAccuracy) {
      if (accuracy > GOOD_ACCURACY_METERS && now - lastGoodFixTsRef.current < GOOD_FIX_HOLD_MS) return;
      if (accuracy <= GOOD_ACCURACY_METERS) lastGoodFixTsRef.current = now;
      lastAccuracyRef.current = accuracy;
    }
    // Parado ao sol, o GPS ainda oscila uns metros a cada leitura. Abaixo de um
    // metro não se mexe o pin: seria um tremer sem informação nenhuma.
    const previous = lastAppliedRef.current;
    if (previous && metersBetween(previous[0], previous[1], lat, lng) < MIN_MOVE_METERS) return;
    lastAppliedRef.current = [lat, lng];
    setPosition([lat, lng]);
  }, []);

  // (em português) Envio único e imediato ao iniciar a partilha, para o vendedor
  // aparecer logo no mapa do banhista sem esperar pelo primeiro fix do serviço
  // nativo. A partir daí, todos os envios são do serviço nativo.
  const sendInitialLocation = useCallback(async (lat, lng, accuracy = null) => {
    const payload = { lat, lng };
    if (typeof accuracy === 'number' && Number.isFinite(accuracy)) payload.accuracy = accuracy;
    const response = await fetch(`${BASE_URL}/vendors/${vendorId}/location`, {
      method: 'PUT',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const message = await readApiError(response, 'Erro ao enviar localização');
      throw new Error(message);
    }
  }, [vendorId, token]);

  const startSharing = async () => {
    setLoading(true);
    setError(null);
    setNotice(null);
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
      // O primeiro ponto é o que os banhistas veem logo: só se reaproveita o
      // pin se ele já tiver uma leitura precisa e fresca; senão pede-se um fix
      // novo, sem cache, e fica o pin como recurso se o GPS não responder.
      let currentLat;
      let currentLng;
      let currentAccuracy = null;
      const pinIsPrecise = position
        && lastAccuracyRef.current !== null
        && lastAccuracyRef.current <= GOOD_ACCURACY_METERS
        && Date.now() - lastGpsTsRef.current < GOOD_FIX_HOLD_MS;
      if (pinIsPrecise) {
        [currentLat, currentLng] = position;
        currentAccuracy = lastAccuracyRef.current;
      } else {
        try {
          const fix = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: INITIAL_FIX_TIMEOUT_MS,
          });
          currentLat = fix.coords.latitude;
          currentLng = fix.coords.longitude;
          currentAccuracy = fix.coords.accuracy ?? null;
        } catch (err) {
          if (!position) throw err;
          [currentLat, currentLng] = position;
          currentAccuracy = lastAccuracyRef.current;
        }
      }

      sharingRef.current = true;

      applyPosition(currentLat, currentLng, 'gps', currentAccuracy);
      await sendInitialLocation(currentLat, currentLng, currentAccuracy);

      // O serviço nativo envia sozinho as posições seguintes. Este ouvinte só
      // atualiza o mapa local enquanto a app está à frente.
      listenerRef.current = await LocationTracker.addListener(
        'locationUpdate',
        ({ lat, lng }) => applyPosition(lat, lng, 'native')
      );
      // (em português) A partilha pode ser desligada pelo próprio serviço
      // nativo quando o vendedor fica meia hora parado. Quando isso acontece o
      // trajeto já foi fechado no servidor pelo lado nativo (a app pode estar em
      // segundo plano, com este JavaScript congelado); aqui só se acerta o que o
      // vendedor vê: o botão volta a "Iniciar partilha" e fica explicado porquê.
      stoppedListenerRef.current = await LocationTracker.addListener(
        'sharingStopped',
        () => {
          setSharing(false);
          setNotice(
            'Estiveste 30 minutos sem te mexeres, por isso a partilha de localização'
            + ' foi desligada por segurança. Carrega em iniciar partilha para voltares'
            + ' a aparecer no mapa.'
          );
          if (listenerRef.current) {
            listenerRef.current.remove();
            listenerRef.current = null;
          }
          if (stoppedListenerRef.current) {
            stoppedListenerRef.current.remove();
            stoppedListenerRef.current = null;
          }
        }
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
    setNotice(null);
    try {
      if (listenerRef.current) {
        await listenerRef.current.remove();
        listenerRef.current = null;
      }
      if (stoppedListenerRef.current) {
        await stoppedListenerRef.current.remove();
        stoppedListenerRef.current = null;
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
      if (stoppedListenerRef.current) stoppedListenerRef.current.remove();
    };
  }, []);

  // (em português) Botão de localização, como o do site: devolve ao mapa o
  // seguimento do vendedor e o modo navegação (a direção para onde está virado
  // fica a apontar para cima), e leva-o à sua posição. Ativa a bússola no
  // toque, que no iOS é o único momento em que a permissão pode ser pedida.
  // Sem posição ainda, só ativa a bússola e o seguimento.
  const handleLocate = async () => {
    await enableCompass();
    setIsAutoFollowing(true);
    setFollowCompass(true);
    const map = mapRef.current;
    if (!map) return;
    if (position) {
      // Zoom fixo, como o botão do site faz para o banhista: quem carrega aqui
      // quer ver-se de perto, e manter o zoom de antes deixava o botão a
      // parecer que não fazia nada quando o mapa já estava centrado.
      map.setView(position, LOCATE_ZOOM, { animate: true });
    }
    // Sem rumo nenhum (bússola negada, telemóvel sem magnetómetro) endireita
    // para norte; com rumo é o controlador de rotação que assume daqui.
    if (targetBearingRef.current === null || isNaN(targetBearingRef.current)) {
      animateToBearing(map, 0);
    }
  };

  // Botão do norte: endireita o mapa e cala a bússola — senão ela voltava a
  // rodá-lo no fotograma seguinte. Quem o quer de volta a seguir a bússola tem
  // o botão de localizar, mesmo ao lado.
  const handleNorthUp = () => {
    setFollowCompass(false);
    animateToBearing(mapRef.current, 0);
  };

  const status = sharing
    ? { label: 'A partilhar', className: 'is-sharing' }
    : { label: 'Offline', className: 'is-idle' };

  return (
    <div className="map-screen">
      {/* Cabeçalho da marca: título e resumo à esquerda, estado da partilha
          à direita — mesma estrutura (e por isso mesma altura) do
          cabeçalho de Produtos. */}
      <BrandHeader>
        <div className="brand-header-row">
          <div className="brand-header-text">
            <h2 className="brand-header-title">Mapa</h2>
            <p className="brand-header-subtitle">
              {sharing
                ? 'Os banhistas veem-te em tempo real'
                : 'Inicia a partilha para apareceres no mapa'}
            </p>
          </div>
          <div className={`brand-header-chip map-status-pill ${status.className}`}>
            <span className="map-status-dot" />
            <span className="map-status-label">{status.label}</span>
          </div>
        </div>
      </BrandHeader>

      <div className="map-area">
        {/* O mapa ocupa todo o fundo da área; o resto é sobreposto. */}
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
            {position && (
              <AnimatedMarker position={position} icon={vendorIcon} hasHeading={hasHeading} />
            )}
            <AutoFollow
              position={position}
              following={isAutoFollowing}
              onUserPan={stopAutoFollowing}
            />
            <MapRotationController
              headingRef={headingRef}
              targetBearingRef={targetBearingRef}
              hasHeading={hasHeading}
              followCompass={followCompass}
              onManualRotate={stopFollowingCompass}
              onRotatedChange={setIsRotated}
            />
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
                  onClick={handleNorthUp}
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

            {notice && (
              <div className="map-alert map-alert--info" role="status">
                <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="12" x2="12" y2="16" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                <span>{notice}</span>
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

            {/* Botão de partilha em pílula, do tamanho do texto, centrado por
                baixo dos controlos — nunca por cima deles. */}
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
