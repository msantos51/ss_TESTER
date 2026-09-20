import { useEffect, useRef, useState } from 'react';

// O rumo alimenta duas coisas com ritmos muito diferentes: a rotação do mapa,
// que corre a cada fotograma e quer todas as leituras da bússola, e o desenho
// da seta do pin, que passa por React e não precisa de mais do que dez
// atualizações por segundo. Guardar as leituras num ref (rápido) e só de vez
// em quando em estado (lento) é o que o mapa do site faz — e é o que faz a
// diferença entre um mapa que acompanha a mão e um que vai aos saltos.
const RAW_THROTTLE_MS = 16;
const MARKER_THROTTLE_MS = 100;
const MAX_ACCURACY_DEG = 50;

// Devolve a direção (graus, 0 = norte, sentido horário) para onde o
// dispositivo está virado, combinando o heading do GPS (quando o vendedor
// se está a mover) com a bússola do dispositivo (quando está parado).
// Devolve também `targetBearingRef`, o mesmo rumo já convertido para bearing
// de mapa (360 − rumo), que o controlador de rotação lê a cada fotograma.
export default function useDeviceHeading() {
  const [heading, setHeading] = useState(null);
  const targetBearingRef = useRef(null);
  const lastHeadingTs = useRef(0);
  const lastMarkerTs = useRef(0);
  const absEventFiredRef = useRef(false);
  const gpsMovingRef = useRef(false);
  const [compassReady, setCompassReady] = useState(false);

  // Uma leitura de rumo: o bearing do mapa é atualizado sempre, o estado do
  // marcador só ao ritmo do React.
  const pushHeading = (geoHeading) => {
    targetBearingRef.current = (360 - geoHeading) % 360;
    const now = Date.now();
    if (now - lastMarkerTs.current < MARKER_THROTTLE_MS) return;
    lastMarkerTs.current = now;
    setHeading(geoHeading);
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
      pushHeading((360 - e.alpha) % 360);
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
      if (raw !== null) pushHeading(raw);
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
  const reportGpsHeading = (gpsHeading, speed) => {
    if (gpsHeading != null && !isNaN(gpsHeading) && speed != null && speed > 0.3) {
      gpsMovingRef.current = true;
      lastHeadingTs.current = Date.now();
      targetBearingRef.current = (360 - gpsHeading) % 360;
      lastMarkerTs.current = Date.now();
      setHeading(gpsHeading);
    } else {
      gpsMovingRef.current = false;
    }
  };

  return { heading, targetBearingRef, reportGpsHeading, enableCompass };
}
