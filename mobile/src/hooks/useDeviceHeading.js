import { useEffect, useRef, useState } from 'react';

// O rumo alimenta duas coisas: a rotação do mapa e o ângulo da seta do pin.
// Ambas correm a cada fotograma, no mesmo sítio (o controlador de rotação do
// mapa), e ambas querem a leitura mais fresca da bússola — por isso o rumo
// vive num ref, que se escreve a custo zero, e não em estado. Passá-lo por
// estado, a dez leituras por segundo, era o que punha a seta a olhar para um
// rumo e o mapa já virado para outro: o desencontro que fazia o pin apontar
// ligeiramente ao lado.
const RAW_THROTTLE_MS = 16;
const MAX_ACCURACY_DEG = 50;
// (em português) Salto de rumo, entre duas leituras da bússola, grande de mais
// para ser o vendedor a virar-se: é interferência magnética (o suporte do
// telemóvel, um altifalante, o metal da carrinha) a fazer o magnetómetro
// disparar para um valor qualquer por um instante. Sem filtro, cada disparo
// destes era exatamente o "pin sempre a rodar" — o mapa e a seta saltavam
// para esse rumo falso e logo a seguir de volta. Só GPS não tem este
// problema (o rumo aí vem do movimento real), por isso o filtro é só para as
// leituras da bússola.
const MAX_COMPASS_JUMP_DEG = 60;
// Confirmação: o mesmo salto grande a repetir-se é mesmo uma viragem, não
// ruído de um instante.
const SPIKE_CONFIRM_DEG = 20;
// (em português) Parado, o magnetómetro oscila uns graus a cada leitura e isso
// fazia a seta e o mapa tremer. Uma zona morta simples tirava o tremer mas
// deixava o rumo parado até 7° ao lado de onde o telemóvel aponta. Aqui há
// histerese: em repouso, só uma diferença maior do que `WAKE_DEG` acorda o
// rumo; acordado, segue a média até ela estabilizar, e só então volta a
// repousar — por isso uma viragem real acaba sempre alinhada, sem sobra.
// Há duas médias: uma lenta, que come o ruído (mesmo o de telemóveis com
// magnetómetros mais nervosos), e uma rápida, que só manda numa viragem real.
const SLOW_ALPHA = 0.04;
const FAST_ALPHA = 0.25;
const TURN_DEG = 15;
const WAKE_DEG = 3;
const SETTLE_DEG = 2.5;
const SETTLE_MS = 400;
const GPS_MIN_SPEED = 0.8;

function bearingGapDeg(a, b) {
  const diff = Math.abs(a - b) % 360;
  return diff > 180 ? 360 - diff : diff;
}

// Um passo de média corrida pelo caminho mais curto do círculo.
function emaStep(current, raw, alpha) {
  let diff = raw - current;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return (current + diff * alpha + 360) % 360;
}

// Devolve `headingRef`, a direção (graus, 0 = norte, sentido horário) para
// onde o dispositivo está virado, combinando o heading do GPS (quando o
// vendedor se está a mover) com a bússola do dispositivo (quando está
// parado), e `targetBearingRef`, o mesmo rumo já convertido para bearing de
// mapa (360 − rumo). `hasHeading` é só o sinal de "já há para onde apontar",
// que muda uma vez e não a cada leitura.
export default function useDeviceHeading() {
  const headingRef = useRef(null);
  const targetBearingRef = useRef(null);
  const [hasHeading, setHasHeading] = useState(false);
  const hasHeadingRef = useRef(false);
  const lastHeadingTs = useRef(0);
  const absEventFiredRef = useRef(false);
  const gpsMovingRef = useRef(false);
  const [compassReady, setCompassReady] = useState(false);
  // Último rumo da bússola aceite e um salto grande ainda por confirmar — ver
  // `acceptCompassHeading`.
  const lastCompassHeadingRef = useRef(null);
  const pendingSpikeRef = useRef(null);
  // Média da bússola, se o rumo está a seguir uma viragem, e onde/quando a
  // média parou de mexer — ver `acceptCompassHeading`.
  const compassEmaRef = useRef(null);
  const compassFastEmaRef = useRef(null);
  const trackingRef = useRef(true);
  const settleAnchorRef = useRef({ value: null, ts: 0 });

  // Uma leitura de rumo: os dois refs ficam sempre em dia; o estado só assina
  // a primeira leitura.
  const pushHeading = (geoHeading) => {
    headingRef.current = geoHeading;
    targetBearingRef.current = (360 - geoHeading) % 360;
    // Só a primeira leitura mexe em estado: as seguintes redesenhariam o ecrã
    // dezenas de vezes por segundo para dizer o mesmo.
    if (!hasHeadingRef.current) {
      hasHeadingRef.current = true;
      setHasHeading(true);
    }
  };

  // Filtra as leituras da bússola antes de as passar a `pushHeading`: um
  // salto isolado maior do que `MAX_COMPASS_JUMP_DEG` é descartado, e só
  // aceite se a leitura seguinte confirmar o mesmo rumo novo.
  const acceptCompassHeading = (raw) => {
    const last = lastCompassHeadingRef.current;
    if (last !== null && bearingGapDeg(raw, last) > MAX_COMPASS_JUMP_DEG) {
      const pending = pendingSpikeRef.current;
      if (pending !== null && bearingGapDeg(pending, raw) < SPIKE_CONFIRM_DEG) {
        pendingSpikeRef.current = null;
      } else {
        pendingSpikeRef.current = raw;
        return;
      }
    } else {
      pendingSpikeRef.current = null;
    }
    lastCompassHeadingRef.current = raw;

    if (compassEmaRef.current === null) {
      compassEmaRef.current = raw;
      compassFastEmaRef.current = raw;
    } else {
      compassEmaRef.current = emaStep(compassEmaRef.current, raw, SLOW_ALPHA);
      compassFastEmaRef.current = emaStep(compassFastEmaRef.current, raw, FAST_ALPHA);
      // Viragem real: a média rápida afasta-se da lenta mais do que o ruído
      // consegue, e a lenta salta para ela em vez de ficar para trás.
      if (bearingGapDeg(compassFastEmaRef.current, compassEmaRef.current) > TURN_DEG) {
        compassEmaRef.current = compassFastEmaRef.current;
      }
    }
    const smoothed = compassEmaRef.current;
    const now = Date.now();

    if (!trackingRef.current) {
      if (headingRef.current !== null && bearingGapDeg(smoothed, headingRef.current) <= WAKE_DEG) return;
      trackingRef.current = true;
      settleAnchorRef.current = { value: smoothed, ts: now };
    }
    pushHeading(smoothed);
    const anchor = settleAnchorRef.current;
    if (anchor.value === null || bearingGapDeg(smoothed, anchor.value) > SETTLE_DEG) {
      settleAnchorRef.current = { value: smoothed, ts: now };
    } else if (now - anchor.ts > SETTLE_MS) {
      trackingRef.current = false;
    }
  };

  // Ativa a bússola. No iOS 13+ `requestPermission` TEM de ser chamado a
  // partir de um gesto do utilizador (um toque), por isso não se pode pedir
  // no arranque — é o botão de localização do mapa que chama isto. Nas
  // plataformas sem esse requisito (Android, desktop) a bússola fica logo
  // pronta no arranque, via o efeito abaixo.
  const enableCompass = async () => {
    if (
      typeof DeviceOrientationEvent === 'undefined' ||
      typeof DeviceOrientationEvent.requestPermission !== 'function'
    ) {
      setCompassReady(true);
      return true;
    }
    try {
      const result = await DeviceOrientationEvent.requestPermission();
      const granted = result === 'granted';
      setCompassReady(granted);
      return granted;
    } catch {
      setCompassReady(false);
      return false;
    }
  };

  // Arranque: nas plataformas que não exigem permissão explícita (Android,
  // desktop) liga logo a bússola. Onde `requestPermission` existe (iOS)
  // espera-se pelo gesto — ver `enableCompass`.
  useEffect(() => {
    if (
      typeof DeviceOrientationEvent === 'undefined' ||
      typeof DeviceOrientationEvent.requestPermission !== 'function'
    ) {
      setCompassReady(true);
    }
  }, []);

  useEffect(() => {
    if (!compassReady) return;

    const onAbsolute = (e) => {
      if (gpsMovingRef.current || e.alpha == null) return;
      const now = Date.now();
      if (now - lastHeadingTs.current < RAW_THROTTLE_MS) return;
      lastHeadingTs.current = now;
      absEventFiredRef.current = true;
      acceptCompassHeading((360 - e.alpha) % 360);
    };

    const onOrientation = (e) => {
      if (gpsMovingRef.current || absEventFiredRef.current) return;
      const now = Date.now();
      if (now - lastHeadingTs.current < RAW_THROTTLE_MS) return;
      if (e.webkitCompassAccuracy != null && e.webkitCompassAccuracy >= 0 && e.webkitCompassAccuracy > MAX_ACCURACY_DEG) return;
      lastHeadingTs.current = now;
      let raw = null;
      if (e.webkitCompassHeading != null) {
        raw = e.webkitCompassHeading;
      } else if (e.alpha != null && e.absolute) {
        raw = (360 - e.alpha) % 360;
      }
      if (raw !== null) acceptCompassHeading(raw);
    };

    window.addEventListener('deviceorientationabsolute', onAbsolute, true);
    window.addEventListener('deviceorientation', onOrientation, true);
    return () => {
      window.removeEventListener('deviceorientationabsolute', onAbsolute, true);
      window.removeEventListener('deviceorientation', onOrientation, true);
    };
  }, [compassReady]);

  // A chamar a partir do callback do watchPosition com pos.coords.heading/speed.
  // Em andamento o rumo do GPS é mais fiável do que a bússola (que o metal do
  // carrinho e o telemóvel na mão baralham), por isso passa à frente dela.
  // O plugin nativo do Android entrega `Location.getBearing()` sem ver se há
  // rumo, e sem rumo isso é 0 exato: um "norte" falso que punha a seta a
  // apontar para cima do mapa. Um rumo real de 0,000° exatos não acontece.
  // Parado, o GPS ainda inventa velocidades de meio metro por segundo com um
  // rumo ao acaso; abaixo de `GPS_MIN_SPEED` quem manda é a bússola.
  const reportGpsHeading = (gpsHeading, speed) => {
    if (gpsHeading != null && !isNaN(gpsHeading) && gpsHeading !== 0 && speed != null && speed > GPS_MIN_SPEED) {
      gpsMovingRef.current = true;
      lastHeadingTs.current = Date.now();
      // O GPS pode levar o rumo para um lado bem diferente de onde a bússola
      // o deixou; sem isto, a leitura da bússola seguinte via um "salto" que
      // não era ruído nenhum e ficava presa à espera de confirmação.
      lastCompassHeadingRef.current = null;
      pendingSpikeRef.current = null;
      compassEmaRef.current = null;
      compassFastEmaRef.current = null;
      trackingRef.current = true;
      settleAnchorRef.current = { value: null, ts: 0 };
      pushHeading(gpsHeading);
    } else {
      gpsMovingRef.current = false;
    }
  };

  return { headingRef, targetBearingRef, hasHeading, reportGpsHeading, enableCompass };
}
